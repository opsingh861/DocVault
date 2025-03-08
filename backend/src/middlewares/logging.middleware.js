import logger from '../utils/logger.js';

const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'error' : 'info';
        logger[logLevel](`Response: ${req.method} ${req.url} - Status: ${res.statusCode} - Duration: ${duration}ms`);
    });
    next();
};

export default requestLogger;