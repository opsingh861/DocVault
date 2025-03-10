import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`);

    if (err.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
    }

    if (err.name === "UnauthorizedError") {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    res.status(500).json({
        error: "An unexpected error occurred",
        message: process.env.NODE_ENV === "production" ? null : err.message,
    });
};

export default errorHandler;
