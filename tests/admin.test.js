const adminController = require('../modules/admin/controller');
const adminService = require('../modules/admin/service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
        }),
        authenticate: jest.fn().mockResolvedValue(),
    };
});

// Mock dependencies
jest.mock('../modules/admin/service');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Admin Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            requestor: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should login successfully with correct credentials', async () => {
            req.body = { email: 'admin@example.com', password: 'password' };
            const mockAdmin = { id: 1, email: 'admin@example.com', password: 'hashed-password' };

            adminService.get.mockResolvedValue([mockAdmin]);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mock-token');

            process.env.JWT_SECRETE = 'secret';
            process.env.JWT_EXPIREIN = '1d';

            await adminController.login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success',
                token: 'mock-token'
            }));
        });

        it('should fail with incorrect password', async () => {
            req.body = { email: 'admin@example.com', password: 'wrong' };
            const mockAdmin = { id: 1, email: 'admin@example.com', password: 'hashed-password' };

            adminService.get.mockResolvedValue([mockAdmin]);
            bcrypt.compare.mockResolvedValue(false);

            await adminController.login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'fail'
            }));
        });

        it('should fail if admin not found', async () => {
            req.body = { email: 'unknown@example.com', password: 'password' };
            adminService.get.mockResolvedValue([undefined]);

            await adminController.login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });
    });

    describe('signup', () => {
        it('should create a new admin', async () => {
            req.body = { email: 'newadmin@example.com', password: 'password' };
            adminService.create.mockResolvedValue({ id: 2, ...req.body });

            await adminController.signup(req, res, next);

            expect(adminService.create).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getMe', () => {
        it('should retrieve admin profile', async () => {
            req.requestor.id = 1;
            const mockAdmin = { id: 1, email: 'admin@example.com' };
            adminService.get.mockResolvedValue(mockAdmin); // Service get usually returns array or object depending on implementation, here assumes getting by ID returns object or array?
            // Controller says: const data = await service.get(...)
            // data is assigned. 
            // User controller was destructuring: const [data] = ...
            // Admin controller: const data = ...
            // Let's check admin controller line 58.

            await adminController.getMe(req, res, next);

            expect(adminService.get).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
