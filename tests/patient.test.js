const patientController = require('../modules/patient/controller');
const patientService = require('../modules/patient/service');
const visitorService = require('../modules/visitor/service');
const treatmentService = require('../modules/treatment/service');
const transactionService = require('../modules/transaction/service');
const treatmentPlanService = require('../modules/treatmentPlan/service');
const clinicService = require('../modules/clinic/service');
const redisClient = require('../utils/redis');

// Mock Database and Sequelize
jest.mock('../config/db', () => ({
    transaction: jest.fn(),
    literal: jest.fn(),
    define: jest.fn().mockReturnValue({
        hasMany: jest.fn(),
        belongsTo: jest.fn(),
        hasOne: jest.fn(),
        findAll: jest.fn(),
        destroy: jest.fn(),
    }),
    authenticate: jest.fn().mockResolvedValue(),
}));

jest.mock('sequelize', () => {
    return {
        INTEGER: 'INTEGER',
        STRING: 'STRING',
        TEXT: 'TEXT',
        ENUM: () => 'ENUM',
        DATEONLY: 'DATEONLY',
        BOOLEAN: 'BOOLEAN',
        Op: {
            gt: 'gt',
            like: 'like',
            or: 'or'
        },
        where: jest.fn(),
        literal: jest.fn()
    };
});

// Mock Models
jest.mock('../modules/treatment/model', () => ({ findAll: jest.fn(), destroy: jest.fn() }));
jest.mock('../modules/medicalHistory/model', () => ({ destroy: jest.fn() }));
jest.mock('../modules/visitor/model', () => ({ destroy: jest.fn() }));
jest.mock('../modules/transaction/model', () => ({ destroy: jest.fn() }));
jest.mock('../modules/prescription/model', () => ({ destroy: jest.fn() }));
jest.mock('../modules/treatmentPlan/model', () => ({ destroy: jest.fn() }));
jest.mock('../modules/patientBill/model', () => ({ destroy: jest.fn() }));

// Mock Services
jest.mock('../modules/patient/service');
jest.mock('../modules/visitor/service');
jest.mock('../modules/treatment/service');
jest.mock('../modules/transaction/service');
jest.mock('../modules/treatmentPlan/service');
jest.mock('../modules/clinic/service');

// Mock Utils
jest.mock('../utils/redis', () => ({
    GET: jest.fn(),
    SET: jest.fn(),
    DEL: jest.fn()
}));
jest.mock('../utils/query', () => ({
    sqquery: jest.fn().mockReturnValue({}),
    usersqquery: jest.fn().mockReturnValue({})
}));
jest.mock('../utils/s3Utils', () => ({
    deleteFromS3: jest.fn()
}));

const Treatment = require('../modules/treatment/model');
const MedicalHistory = require('../modules/medicalHistory/model');
const Prescription = require('../modules/prescription/model');
const TreatmentPlan = require('../modules/treatmentPlan/model');
const PatientBill = require('../modules/patientBill/model');

describe('Patient Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            requestor: { id: 1, subscription: { planType: 'Pro Plan', patientCount: 0, patientLimit: 100 } },
            files: []
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new patient successfully', async () => {
            req.body = { name: 'Test Patient', mobile: '1234567890', clinicId: 1 };

            clinicService.get.mockResolvedValue([{ id: 1, timeRanges: [] }]);
            patientService.create.mockResolvedValue({ id: 1, name: 'Test Patient', mobile: '1234567890' });
            visitorService.create.mockResolvedValue({});
            treatmentPlanService.create.mockResolvedValue({});
            redisClient.GET.mockResolvedValue(null);

            await patientController.create(req, res, next);

            expect(patientService.create).toHaveBeenCalled();
            expect(treatmentPlanService.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success',
                message: 'Patient added successfully'
            }));
        });

        it('should fail if subscription limit reached', async () => {
            req.requestor.subscription = { planType: 'Free Plan', patientCount: 10, patientLimit: 10 };

            await patientController.create(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('You Can Add max 10 patient')
            }));
        });
    });

    describe('getAllByUser', () => {
        it('should retrieve all patients for the user', async () => {
            patientService.get.mockResolvedValue([{ id: 1, name: 'Test' }]);

            await patientController.getAllByUser(req, res, next);

            expect(patientService.get).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success',
                data: expect.any(Array)
            }));
        });
    });

    describe('getOne', () => {
        it('should retrieve single patient details with calculations', async () => {
            req.params.id = 1;
            const mockPatient = { id: 1, name: 'Test' };

            patientService.get.mockResolvedValue([mockPatient]); // patientData
            transactionService.sum.mockResolvedValue(500); // receivedPayment
            treatmentService.sum.mockResolvedValue(1000); // totalPayment
            visitorService.get.mockResolvedValue([{ date: '2023-01-01' }]); // nextSchedule
            treatmentPlanService.sum.mockResolvedValue(100); // totalDiscount

            await patientController.getOne(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success',
                receivedPayment: 500,
                totalPayment: 1000,
                discountAmount: 100,
                finalPayment: 900, // 1000 - 100
                pendingPayment: 400 // 900 - 500
            }));
        });
    });

    describe('remove', () => {
        it('should delete a patient and all related data', async () => {
            req.params.id = 1;
            patientService.count.mockResolvedValue(1); // User has permission

            const mockTreatments = [{ id: 100 }];
            Treatment.findAll.mockResolvedValue(mockTreatments);

            treatmentService.remove.mockResolvedValue({});
            transactionService.remove.mockResolvedValue({});
            MedicalHistory.destroy.mockResolvedValue({});
            visitorService.remove.mockResolvedValue({});
            Prescription.destroy.mockResolvedValue({});
            treatmentPlanService.remove.mockResolvedValue({});
            PatientBill.destroy.mockResolvedValue({});

            patientService.remove.mockResolvedValue({ affectedRows: 1 });

            await patientController.remove(req, res, next);

            expect(Treatment.findAll).toHaveBeenCalled();
            expect(treatmentService.remove).toHaveBeenCalled();
            expect(patientService.remove).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should fail if patient not found or permission denied', async () => {
            req.params.id = 1;
            patientService.count.mockResolvedValue(0);

            await patientController.remove(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
