const clinicController = require('../modules/clinic/controller');
const clinicService = require('../modules/clinic/service');
const Treatment = require('../modules/treatment/model');
const TreatmentPlan = require('../modules/treatmentPlan/model');
const Transaction = require('../modules/transaction/model');
const Visitor = require('../modules/visitor/model');
const PatientBill = require('../modules/patientBill/model');
const { assignTimeSlotsAfterUpgrade } = require('../modules/razorpay/utils');

// Mock Database
jest.mock('../config/db', () => ({
    transaction: jest.fn(),
    literal: jest.fn(),
    define: jest.fn().mockReturnValue({
        hasMany: jest.fn(),
        belongsTo: jest.fn(),
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
jest.mock('../modules/user/model', () => ({
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
}));

jest.mock('../modules/treatment/model', () => ({
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
}));

jest.mock('../modules/treatmentPlan/model', () => ({
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
}));

jest.mock('../modules/transaction/model', () => ({
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
}));

jest.mock('../modules/visitor/model', () => ({
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
}));

jest.mock('../modules/patientBill/model', () => ({
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
}));

// Mock Services and Utils
jest.mock('../modules/clinic/service');
jest.mock('../modules/razorpay/utils', () => ({
    assignTimeSlotsAfterUpgrade: jest.fn()
}));
jest.mock('../utils/query', () => ({
    sqquery: jest.fn().mockReturnValue({}),
    usersqquery: jest.fn().mockReturnValue({})
}));

describe('Clinic Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            requestor: {
                id: 1,
                subscription: {
                    planType: 'Pro Plan',
                    patientLimit: 100
                }
            }
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
        it('should create a new clinic successfully', async () => {
            req.body = { name: 'New Clinic', mobile: '9876543210' };
            clinicService.count.mockResolvedValue(0); // No existing clinics
            clinicService.create.mockResolvedValue({ id: 1, ...req.body });

            await clinicController.create(req, res, next);

            expect(clinicService.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success',
                message: 'Add Clinic successfully'
            }));
        });

        it('should fail if clinic limit reached (Max 3)', async () => {
            clinicService.count.mockResolvedValue(3);

            await clinicController.create(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('You Can Add max 3 clinic')
            }));
        });
    });

    describe('getAll', () => {
        it('should retrieve all clinics', async () => {
            clinicService.get.mockResolvedValue([{ id: 1, name: 'Clinic 1' }]);

            await clinicController.getAll(req, res, next);

            expect(clinicService.get).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('edit', () => {
        it('should update clinic details', async () => {
            req.params.id = 1;
            req.body = { name: 'Updated Clinic' };
            clinicService.update.mockResolvedValue([1]);

            await clinicController.edit(req, res, next);

            expect(clinicService.update).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should trigger time slot assignment if scheduleByTime is present', async () => {
            req.params.id = 1;
            req.body = { scheduleByTime: true };
            clinicService.update.mockResolvedValue([1]);

            await clinicController.edit(req, res, next);

            expect(assignTimeSlotsAfterUpgrade).toHaveBeenCalledWith([1], 1);
        });
    });

    describe('remove', () => {
        it('should delete clinic and related data if more than 1 clinic exists', async () => {
            req.params.id = 1;
            clinicService.count
                .mockResolvedValueOnce(2) // Total clinics count > 1
                .mockResolvedValueOnce(1); // Target clinic exists

            Treatment.findAll.mockResolvedValue([{ id: 10 }]);
            clinicService.remove.mockResolvedValue({ affectedRows: 1 });

            await clinicController.remove(req, res, next);

            expect(Treatment.destroy).toHaveBeenCalled();
            expect(Transaction.destroy).toHaveBeenCalled();
            expect(clinicService.remove).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should fail if only 1 clinic remains', async () => {
            clinicService.count.mockResolvedValue(1); // Only 1 clinic

            await clinicController.remove(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('Minimum 1 clinic is required')
            }));
        });
    });
});
