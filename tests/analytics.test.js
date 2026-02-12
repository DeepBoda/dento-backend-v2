const analyticsController = require('../modules/analytics/controller');
const dailyActivityController = require('../modules/dailyActivity/controller');
const dailyActivityService = require('../modules/dailyActivity/service');
const User = require('../modules/user/model');
const Patient = require('../modules/patient/model');
const Visitor = require('../modules/visitor/model');
const Transaction = require('../modules/transaction/model');
const Clinic = require('../modules/clinic/model');
const UserTransaction = require('../modules/userTransaction/model');
const Treatment = require('../modules/treatment/model');
const TreatmentPlan = require('../modules/treatmentPlan/model');

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

// Mock Services
jest.mock('../modules/dailyActivity/service');

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
    sum: jest.fn(),
}));
jest.mock('../modules/patient/model', () => ({
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
    sum: jest.fn(),
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
    sum: jest.fn(),
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
    sum: jest.fn(),
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
    sum: jest.fn(),
}));
jest.mock('../modules/userTransaction/model', () => ({
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
    sum: jest.fn(),
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
    sum: jest.fn(),
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
    sum: jest.fn(),
}));

// Mock Utils
jest.mock('../utils/query', () => ({
    sqquery: jest.fn().mockReturnValue({}),
    usersqquery: jest.fn().mockReturnValue({})
}));

describe('Analytics Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
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

    describe('getAll', () => {
        it('should return aggregated analytics data', async () => {
            User.count.mockResolvedValue(5);
            Patient.count.mockResolvedValue(10);
            Visitor.count.mockResolvedValue(15);
            Transaction.count.mockResolvedValue(20);
            Clinic.count.mockResolvedValue(2);
            UserTransaction.findAll.mockResolvedValue([]);

            await analyticsController.getAll(req, res, next);

            expect(User.count).toHaveBeenCalled();
            expect(Patient.count).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    doctor: 5,
                    patient: 10
                })
            }));
        });
    });

    describe('getDashboardAnalytics', () => {
        it('should return dashboard analytics for user', async () => {
            Clinic.findAll.mockResolvedValue([{ id: 1 }]);
            TreatmentPlan.findAll.mockResolvedValue([{ id: 1 }]);
            Treatment.sum.mockResolvedValue(1000); // Revenue
            Transaction.sum.mockResolvedValue(500); // Payment
            Patient.count.mockResolvedValue(5);
            Visitor.count.mockResolvedValue(3);

            await analyticsController.getDashboardAnalytics(req, res, next);

            expect(Clinic.findAll).toHaveBeenCalled();
            expect(TreatmentPlan.findAll).toHaveBeenCalled();
            expect(Treatment.sum).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    totalRevenue: 1000,
                    totalPayment: 500,
                    totalPendingAmount: 500
                })
            }));
        });
    });
});

describe('DailyActivity Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: { activity: 'Test' },
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
        it('should create daily activity', async () => {
            dailyActivityService.create.mockResolvedValue({ id: 1 });

            await dailyActivityController.create(req, res, next);

            expect(dailyActivityService.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('getAllByUser', () => {
        it('should get all activities for user', async () => {
            dailyActivityService.get.mockResolvedValue([]);

            await dailyActivityController.getAllByUser(req, res, next);

            expect(dailyActivityService.get).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
