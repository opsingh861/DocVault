import Credit from "../model/credit.model.js";
import CreditRequest from "../model/creditRequest.model.js";
import Document from "../model/document.model.js";
import User from "../model/user.model.js";
import { NotFoundError } from "../utils/error.js";
import logger from "../utils/logger.js"; // Logging module

const getUserData = async (user_id) => {
    try {
        logger.info(`Fetching user data for user_id: ${user_id}`);

        const user = await User.findOne({ where: { user_id } });
        if (!user) throw new NotFoundError("User not found");

        const credit = await Credit.findOne({ where: { user_id } });
        if (!credit) throw new NotFoundError("Credit not found");

        return {
            username: user.username,
            name: user.name,
            credit: credit.current_balance,
            limit: credit.limit_credit,
        };
    } catch (error) {
        logger.error(`Error fetching user data for user_id ${user_id}: ${error.message}`);
        throw error;
    }
};

const getPreviousScans = async (user_id) => {
    try {
        logger.info(`Fetching previous scans for user_id: ${user_id}`);

        const scans = await Document.findAll({ where: { user_id } });

        if (!scans || scans.length === 0) {
            logger.warn(`No scans found for user_id: ${user_id}`);
            return { status: 404, message: "No scans found" };
        }

        const data = scans.map(scan => ({
            title: scan.title,
            upload_date: scan.upload_date
        }));

        return { status: 200, data };
    } catch (error) {
        logger.error(`Error fetching previous scans for user_id ${user_id}: ${error.message}`);
        return { status: 500, error: "Internal server error" };
    }
};

const getCreditRequestHistory = async (user_id) => {
    try {
        logger.info(`Fetching credit request history for user_id: ${user_id}`);

        const creditRequests = await CreditRequest.findAll({ where: { user_id } });

        if (!creditRequests || creditRequests.length === 0) {
            logger.warn(`No credit requests found for user_id: ${user_id}`);
            return { status: 404, message: "No credit requests found" };
        }

        const data = creditRequests.map(request => ({
            request_id: request.request_id,
            amount: request.requested_amount,
            status: request.status,
            request_date: request.request_date,
            response_date: request.response_date,
            admin_notes: request.admin_notes || "No notes",
        }));

        return { status: 200, data };
    } catch (error) {
        logger.error(`Error fetching credit request history for user_id ${user_id}: ${error.message}`);
        return { status: 500, error: "Internal server error" };
    }
};

export default { getUserData, getPreviousScans, getCreditRequestHistory };
