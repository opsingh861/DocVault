import { createLogger, format, transports } from 'winston';
import fs from 'fs';
import path from 'path';

const logDir = 'logs';

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const { combine, timestamp, printf, colorize, errors } = format;

// Define log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return stack
        ? `[${timestamp}] ${level.toUpperCase()}: ${message}\nStack: ${stack}`
        : `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

// Create logger
const logger = createLogger({
    level: 'info',
    format: combine(
        errors({ stack: true }),  // Capture stack traces
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        new transports.Console({
            format: combine(colorize(), logFormat),
        }),
        new transports.File({
            filename: path.join(logDir, 'app.log'),
            level: 'info', // Logs only 'info' and higher (warn, error)
        }),
        new transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error', // Logs only errors
        })
    ]
});

export default logger;
