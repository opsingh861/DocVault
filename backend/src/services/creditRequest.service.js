import Credit from "../model/credit.model.js";
import CreditRequest from "../model/creditRequest.model.js";
import logger from "../utils/logger.js";
import { db } from "../utils/database.js"; // Sequelize instance

const requestCredit = async (amount, reason, user_id) => {
    const transaction = await db.transaction();

    try {
        logger.info(`Processing credit request for user_id: ${user_id}`);

        const credit = await Credit.findOne({ where: { user_id }, transaction });

        if (!credit) {
            throw new Error("No credit record found for this user.");
        }

        const { current_balance, limit_credit } = credit.dataValues || {};

        if (current_balance > 0) {
            throw new Error("Credit is already in your account.");
        }

        if (limit_credit < amount) {
            throw new Error("Requested amount exceeds your credit limit.");
        }

        const creditRequested = await CreditRequest.create(
            { user_id, requested_amount: amount, reason: reason ?? "" },
            { transaction }
        );

        await transaction.commit();
        logger.info(`Credit request created successfully for User ID: ${user_id}, Amount: ${amount}`);

        return creditRequested;
    } catch (error) {
        await transaction.rollback();
        logger.error(`Error in requestCreditService: ${error.stack}`);
        throw new Error(`Credit request failed: ${error.message}`);
    }
};

export default { requestCredit };
