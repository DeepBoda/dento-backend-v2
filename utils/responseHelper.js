/**
 * Response helper utilities for consistent API responses.
 */

/**
 * Send a success response.
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
exports.sendSuccess = (res, data, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Send a created response (201).
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 */
exports.sendCreated = (res, data, message = "Created successfully") => {
    return res.status(201).json({
        success: true,
        message,
        data,
    });
};

/**
 * Send an error response.
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {*} errors - Additional error details
 */
exports.sendError = (res, message = "Bad Request", statusCode = 400, errors = null) => {
    const body = { success: false, message };
    if (errors) body.errors = errors;
    return res.status(statusCode).json(body);
};

/**
 * Send a paginated response.
 * @param {Object} res - Express response object
 * @param {Array} data - Array of records
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Success message
 */
exports.sendPaginated = (res, data, pagination, message = "Success") => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination,
    });
};

/**
 * Send a not found response (404).
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name
 */
exports.sendNotFound = (res, resource = "Resource") => {
    return res.status(404).json({
        success: false,
        message: `${resource} not found`,
    });
};
