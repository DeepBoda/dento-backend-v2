/**
 * Request logging middleware.
 * Logs incoming requests with method, path, status, and response time.
 */

const requestLogger = (req, res, next) => {
    const start = Date.now();
    const { method, path: reqPath, ip } = req;

    res.on("finish", () => {
        const duration = Date.now() - start;
        const { statusCode } = res;
        const level = statusCode >= 500 ? "ERROR" : statusCode >= 400 ? "WARN" : "INFO";
        if (process.env.NODE_ENV !== "test") {
            console.log(
                `[${level}] ${new Date().toISOString()} ${method} ${reqPath} ${statusCode} ${duration}ms - ${ip}`
            );
        }
    });

    next();
};

module.exports = requestLogger;
