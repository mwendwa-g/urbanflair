function errorHandler(err, req, res, next) {
    const statusCode = err.status || 500; // Default to 500 if no status is set
    res.status(statusCode).send(err.message || "An unexpected error occurred");

    console.error(`[${statusCode}] ${err.message}`); // Log for debugging
}

module.exports = errorHandler;
