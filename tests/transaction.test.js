const transactionController = require('../modules/transaction/controller');
const service = require('../modules/transaction/service');
const visitorService = require('../modules/visitor/service');
const Patient = require('../modules/patient/model');
const Clinic = require('../modules/clinic/model');
const Treatment = require('../modules/treatment/model');
const Visitor = require('../modules/visitor/model');
const { createVisitorWithSlot } = require('../utils/commonFunction');

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
    fn: jest.fn(),
    col: jest.fn(),
}));

// Mock Models
jest.mock('../modules/patient/model', () => ({
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
    findOrCreate: jest.fn(),
}));

jest.mock('../modules/clinic/model', () => ({
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
    findOrCreate: jest.fn(),
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
    increment: jest.fn(),
    decrement: jest.fn(),
    findOrCreate: jest.fn(),
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
    increment: jest.fn(),
    decrement: jest.fn(),
    findOrCreate: jest.fn(),
}));

// Mock Services
jest.mock('../modules/transaction/service');
jest.mock('../modules/visitor/service');

// Mock Utils
jest.mock('../utils/query', () => ({
    sqquery: jest.fn().mockReturnValue({}),
    usersqquery: jest.fn().mockReturnValue({})
}));

jest.mock('../utils/commonFunction', () => ({
    createVisitorWithSlot: jest.fn()
}));

// Mock moment
// jest.mock('moment', () => {
//   const originalMoment = jest.requireActual('moment');
//   return (date) => originalMoment(date || '2023-01-01T12:00:00Z');
// });
// Mocking moment can be tricky, let's rely on logic not crashing.

describe('Transaction Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                clinicId: 1,
                patientId: 1,
                amount: 100,
                isComplete: false,
                date: '2023-01-01',
                cash: 50,
                online: 50
            },
            params: { id: 1 },
            query: {},
            requestor: {
                id: 1,
                subscription: { planType: 'Pro Plan' }
            },
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
        it('should create a new transaction successfully', async () => {
            service.create.mockResolvedValue({ id: 1, amount: 100 });
            Patient.update.mockResolvedValue({});
            visitorService.remove.mockResolvedValue({});
            Visitor.findOrCreate.mockResolvedValue({});
            createVisitorWithSlot.mockResolvedValue({});

            await transactionController.create(req, res, next);

            expect(service.create).toHaveBeenCalled();
            expect(createVisitorWithSlot).toHaveBeenCalled();
            expect(Patient.update).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Add Transaction successfully'
            }));
        });

        it('should complete treatment and remove future visitors if isComplete is true', async () => {
            req.body.isComplete = true;
            service.create.mockResolvedValue({ id: 1 });
            Treatment.update.mockResolvedValue({});

            await transactionController.create(req, res, next);

            expect(Treatment.update).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'Done' }),
                expect.anything()
            );
            expect(visitorService.remove).toHaveBeenCalled();
        });
    });

    describe('getAllByUser', () => {
        it('should get all transactions for user clinic', async () => {
            Clinic.findAll.mockResolvedValue([{ id: 1 }]);
            service.get.mockResolvedValue([{ id: 1 }]);

            await transactionController.getAllByUser(req, res, next);

            expect(Clinic.findAll).toHaveBeenCalled();
            expect(service.get).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('edit', () => {
        it('should edit a transaction', async () => {
            service.get.mockResolvedValue([{ id: 1, createdAt: '2023-01-01' }]);
            service.update.mockResolvedValue([1]);

            await transactionController.edit(req, res, next);

            expect(service.update).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should fail if transaction not found', async () => {
            service.get.mockResolvedValue([]);

            await transactionController.edit(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Transaction not found',
                status: 404
            }));
        });
    });

    describe('remove', () => {
        it('should remove a transaction', async () => {
            service.get.mockResolvedValue([{ id: 1, clinicId: 1, patientId: 1, createdAt: '2023-01-01' }]);
            service.remove.mockResolvedValue({ affectedRows: 1 });
            // Mock other transactions check
            service.get.mockResolvedValueOnce([{ id: 1, clinicId: 1 }]) // first call for checking existence
                .mockResolvedValueOnce([]); // second call for other transactions on previous date

            await transactionController.remove(req, res, next);

            expect(service.remove).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
