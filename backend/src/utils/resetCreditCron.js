import cron from "node-cron";
import Credit from "../model/credit.model.js";
import logger from "./logger.js";

// Cron job to reset credits at 12:00 AM daily
const resetCreditCron = () => {
    cron.schedule("0 0 * * *", async () => {
        try {
            logger.info("Starting daily credit reset...");

            // Reset `current_balance` to `limit_credit` for all users
            const updatedRows = await Credit.update(
                { current_balance: Credit.sequelize.col("limit_credit") },
                { where: {} }
            );

            logger.info(`Successfully reset credits for ${updatedRows[0]} users.`);
        } catch (error) {
            logger.error("Error in credit reset cron job", { errorMessage: error.message, errorStack: error.stack });
        }
    }, {
        timezone: "Asia/Kolkata", // Set to your timezone
    });

    logger.info("Credit reset cron job scheduled to run at 12:00 AM daily.");
};

export default resetCreditCron;
