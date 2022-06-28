const AppError = require("./../utils/appError");

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateKeyErrorDB = (err) => {
    const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
    const message = `Duplicate field value: ${value[0]}. Please use another value!`;
    return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    // Operational errors
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });

        // Programming errors
    } else {
        console.log("ERROR>> ", err);
        res.status(500).json({
            status: "error",
            message: "Something went very wrong!",
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    let error = { ...err };
    error.name = err.name || "";
    error.message = err.message || "";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(error, res);
    } else if (process.env.NODE_ENV === "production") {
        if (error.name === "CastError") error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateKeyErrorDB(error);

        sendErrorProd(error, res);
    }
};
