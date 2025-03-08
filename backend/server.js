import app from "./config/app.js";
import { connectDB } from "./src/utils/database.js";
import logger from "./src/utils/logger.js";

const PORT = process.env.SERVER_PORT || 3000;

process.on("uncaughtException", (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1); // Crash the app
});

process.on("unhandledRejection", (err) => {
    logger.error(`Unhandled Promise Rejection: ${err}`);
});

connectDB().then(() => {
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
});
