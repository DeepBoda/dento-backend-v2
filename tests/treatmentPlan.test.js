const treatmentPlanController = require('../modules/treatmentPlan/controller');
const service = require('../modules/treatmentPlan/service');
const patientService = require('../modules/patient/service');
const clinicService = require('../modules/clinic/service');

// Mock Database (not directly used but required by some services if they query)
jest.mock('../config/db', () => ({
    sequelize: {
        transaction: jest.fn(),
        literal: jest.fn(),
        define: jest.fn().mockReturnValue({}),
    },
    DataTypes: {},
}));

// Mock Models
jest.mock('../modules/treatmentPlan/model', () => ({}));
jest.mock('../modules/patient/model', () => ({}));
jest.mock('../modules/clinic/model', () => ({}));

// Mock Services
jest.mock('../modules/treatmentPlan/service');
jest.mock('../modules/patient/service');
jest.mock('../modules/clinic/service');

// Mock Utils
jest.mock('../utils/query', () => ({
    usersqquery: jest.fn().mockReturnValue({})
}));

describe('TreatmentPlan Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: { patientId: 1, clinicId: 1, name: 'Plan A' },
            params: {},
            query: {},
            requestor: { id: 1 },
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
        it('should create a new treatment plan successfully', async () => {
            patientService.count.mockResolvedValue(1); // Patient found
            clinicService.count.mockResolvedValue(1); // Clinic found
            service.create.mockResolvedValue({ id: 1, ...req.body });

            await treatmentPlanController.create(req, res, next);

            expect(patientService.count).toHaveBeenCalled();
            expect(clinicService.count).toHaveBeenCalled();
            expect(service.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success',
                message: 'Add Treatment List successfully'
            }));
        });

        it('should fail if patient not found', async () => {
            patientService.count.mockResolvedValue(0);

            await treatmentPlanController.create(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Patient not found',
                status: 404
            }));
        });

        it('should fail if clinic not found', async () => {
            patientService.count.mockResolvedValue(1);
            clinicService.count.mockResolvedValue(0);

            await treatmentPlanController.create(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Clinic not found',
                status: 404
            }));
        });
    });

    describe('edit', () => {
        it('should edit a treatment plan successfully', async () => {
            req.params.id = 1;
            service.get.mockResolvedValue([{ id: 1, clinicId: 1 }]);
            clinicService.count.mockResolvedValue(1); // Clinic valid for user
            service.update.mockResolvedValue([1]);

            await treatmentPlanController.edit(req, res, next);

            expect(service.update).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should fail if plan not found', async () => {
            req.params.id = 1;
            service.get.mockResolvedValue([]); // No data found

            await treatmentPlanController.edit(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Data not found',
                status: 404
            }));
        });
    });

    describe('remove', () => {
        it('should remove a treatment plan successfully', async () => {
            req.params.id = 1;
            service.get.mockResolvedValue([{ id: 1, clinicId: 1 }]);
            clinicService.count.mockResolvedValue(1);
            service.remove.mockResolvedValue({ affectedRows: 1 });

            await treatmentPlanController.remove(req, res, next);

            expect(service.remove).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getAllByUser', () => {
        it('should get all plans for user', async () => {
            service.get.mockResolvedValue([{ id: 1 }]);

            await treatmentPlanController.getAllByUser(req, res, next);

            expect(service.get).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
