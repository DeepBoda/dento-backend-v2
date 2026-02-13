/**
 * Centralized error handling middleware.
 * Normalizes all errors into a consistent JSON response format.
 */

const createError = require("http-errors");

/**
 * Convert known error types to HTTP errors.
 */
const normalizeError = (err) => {
    // Sequelize validation errors
    if (err.name === "SequelizeValidationError") {
        return createError(400, err.errors.map((e) => e.message).join(", "));
    }
    if (err.name === "SequelizeUniqueConstraintError") {
        return createError(409, "Resource already exists");
    }
    if (err.name === "SequelizeForeignKeyConstraintError") {
        return createError(400, "Invalid reference: related resource not found");
    }
    if (err.name === "SequelizeDatabaseError") {
        return createError(500, "Database error occurred");
    }
    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return createError(401, "Invalid token");
    }
    if (err.name === "TokenExpiredError") {
        return createError(401, "Token has expired");
    }
    return err;
};

/**
 * Global error handler middleware.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    const normalizedErr = normalizeError(err);

    const status = normalizedErr.status || normalizedErr.statusCode || 500;
    const message = normalizedErr.message || "Internal Server Error";

    // Log server errors
    if (status >= 500) {
        console.error(`[ERROR] ${req.method} ${req.path} - ${status}: ${message}`);
        if (process.env.NODE_ENV === "development") {
            console.error(err.stack);
        }
    }

    res.status(status).json({
        success: false,
        status,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

module.exports = errorHandler;
