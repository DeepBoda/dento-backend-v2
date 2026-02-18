const patientBillController = require('../modules/patientBill/controller');
const service = require('../modules/patientBill/service');

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

// Mock Models
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

// Mock Services
jest.mock('../modules/patientBill/service');

// Mock Utils
jest.mock('../utils/query', () => ({
    usersqquery: jest.fn().mockReturnValue({})
}));

describe('PatientBill Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                name: 'Bill 1',
                amount: 100
            },
            params: { id: 1 },
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
        it('should create a new bill successfully', async () => {
            service.create.mockResolvedValue({ id: 1, ...req.body });

            await patientBillController.create(req, res, next);

            expect(service.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Add PatientBill successfully'
            }));
        });
    });

    describe('getAllByUser', () => {
        it('should get all bills for user', async () => {
            service.get.mockResolvedValue([{ id: 1 }]);

            await patientBillController.getAllByUser(req, res, next);

            expect(service.get).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getOne', () => {
        it('should get one bill', async () => {
            service.get.mockResolvedValue([{ id: 1 }]);

            await patientBillController.getOne(req, res, next);

            expect(service.get).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('edit', () => {
        it('should edit a bill', async () => {
            service.update.mockResolvedValue([1]);

            await patientBillController.edit(req, res, next);

            expect(service.update).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('remove', () => {
        it('should remove a bill', async () => {
            service.remove.mockResolvedValue({ affectedRows: 1 });

            await patientBillController.remove(req, res, next);

            expect(service.remove).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
