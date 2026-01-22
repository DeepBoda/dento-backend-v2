// Mock Sequelize package for types
jest.mock('sequelize', () => {
    return {
        INTEGER: 'INTEGER',
        STRING: 'STRING',
        TEXT: 'TEXT',
        ENUM: () => 'ENUM',
        DATEONLY: 'DATEONLY',
        BOOLEAN: 'BOOLEAN',
        Op: {
            not: 'not',
            like: 'like',
            or: 'or',
        },
    };
});

// Mock DB instance
jest.mock('../config/db', () => {
    return {
        transaction: jest.fn(),
        define: jest.fn().mockReturnValue({
            hasMany: jest.fn(),
            belongsTo: jest.fn(),
            hasOne: jest.fn(),
            belongsToMany: jest.fn(),
        }),
        authenticate: jest.fn().mockResolvedValue(),
    };
});

const userController = require('../modules/user/controller');
const userService = require('../modules/user/service');
const msg91Services = require('../utils/msg91');
const auth = require('../middleware/auth');
const userSubscriptionService = require('../modules/userSubscription/service');
const subscriptionService = require('../modules/subscription/service');
const UserTransaction = require('../modules/userTransaction/model');
const Patient = require('../modules/patient/model');
const Clinic = require('../modules/clinic/model');
const jwt = require('jsonwebtoken');

const Template = require('../modules/template/model');
const firebase = require('../utils/firebaseConfige');

// Mock dependencies
jest.mock('../modules/user/service');
jest.mock('../utils/msg91');
jest.mock('../middleware/auth');
jest.mock('../modules/userSubscription/service');
jest.mock('../modules/subscription/service');
jest.mock('../modules/userTransaction/model');
jest.mock('../modules/patient/model');
jest.mock('../modules/clinic/model');
jest.mock('../modules/template/model');
jest.mock('../utils/firebaseConfige', () => ({}));
jest.mock('../modules/clinic/controller', () => ({
    deleteClinicAndClinicRelation: jest.fn()
}));
jest.mock('../modules/patient/controller', () => ({
    deletePatientAndPatientRelation: jest.fn()
}));
jest.mock('../utils/redis', () => ({
    DEL: jest.fn(),
    SET: jest.fn(),
    GET: jest.fn(),
}));

describe('User Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            requestor: {},
            files: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('sendOTP', () => {
        it('should send OTP successfully', async () => {
            req.body.mobile = '9876543210';
            userService.count.mockResolvedValue(0); // No deleted user
            auth.singMobileToken.mockReturnValue('mock-token');
            msg91Services.sendOTP.mockResolvedValue({ type: 'success' });

            await userController.sendOTP(req, res, next);

            expect(msg91Services.sendOTP).toHaveBeenCalledWith('9876543210', 91);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success',
                message: 'OTP send successfully',
                token: 'mock-token'
            }));
        });

        it('should return error if MSG91 fails', async () => {
            req.body.mobile = '9876543210';
            userService.count.mockResolvedValue(0);
            msg91Services.sendOTP.mockResolvedValue({ type: 'error', message: 'Failed' });

            await userController.sendOTP(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('verifyOTP', () => {
        it('should verify OTP and register new user', async () => {
            req.body = { otp: '1234', mobile: '9876543210' };
            req.requestor = { mobile: '9876543210' };

            // Not the backdoor number
            msg91Services.verifyOTP.mockResolvedValue({ type: 'success' });
            userService.get.mockResolvedValue([null]); // User not found
            auth.singMobileToken.mockResolvedValue('mock-new-user-token');

            await userController.verifyOTP(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success',
                user: 'new',
                token: 'mock-new-user-token'
            }));
        });

        it('should verify OTP and login existing user', async () => {
            req.body = { otp: '1234', mobile: '9876543210' };
            req.requestor = { mobile: '9876543210' };

            msg91Services.verifyOTP.mockResolvedValue({ type: 'success' });
            userService.get.mockResolvedValue([{ id: 1, role: 'User' }]); // User found

            process.env.JWT_SECRETE = 'secret';
            process.env.JWT_EXPIREIN = '1d';

            await userController.verifyOTP(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success',
                user: 'old'
            }));
        });
    });

    describe('create (Register)', () => {
        it('should create a new user', async () => {
            req.body = { mobile: '9876543210', email: 'test@example.com' };
            userService.get.mockResolvedValue([]); // No existing user
            userService.create.mockResolvedValue({ id: 1, ...req.body });

            await userController.create(req, res, next);

            expect(userService.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should fail if mobile already exists', async () => {
            req.body = { mobile: '9876543210' };
            userService.get.mockResolvedValueOnce(['existing-user']);

            await userController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('Phone Number is already register')
            }));
        });
    });
});
