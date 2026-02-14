/**
 * Input sanitization utilities.
 * Strips dangerous characters and normalizes user input
 * to prevent XSS and injection attacks.
 */

/**
 * Strip HTML tags from a string.
 * @param {string} str
 * @returns {string}
 */
exports.stripHtml = (str) => {
    if (typeof str !== "string") return str;
    return str.replace(/<[^>]*>/g, "").trim();
};

/**
 * Sanitize a string: strip HTML and trim whitespace.
 * @param {string} str
 * @returns {string}
 */
exports.sanitizeString = (str) => {
    if (typeof str !== "string") return str;
    return str.replace(/<[^>]*>/g, "").replace(/[<>'"]/g, "").trim();
};

/**
 * Sanitize all string fields in an object (shallow).
 * @param {Object} obj
 * @returns {Object}
 */
exports.sanitizeObject = (obj) => {
    if (!obj || typeof obj !== "object") return obj;
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = typeof value === "string" ? exports.sanitizeString(value) : value;
    }
    return sanitized;
};

/**
 * Normalize a phone number to digits only.
 * @param {string} phone
 * @returns {string}
 */
exports.normalizePhone = (phone) => {
    if (typeof phone !== "string") return phone;
    return phone.replace(/\D/g, "").slice(-10);
};

/**
 * Sanitize middleware - sanitizes req.body string fields.
 */
exports.sanitizeBody = (req, res, next) => {
    if (req.body && typeof req.body === "object") {
        req.body = exports.sanitizeObject(req.body);
    }
    next();
};
