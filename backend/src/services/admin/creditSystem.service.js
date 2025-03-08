import CreditRequest from "../../model/creditRequest.model.js";
import Credit from "../../model/credit.model.js";
import logger from "../../utils/logger.js"; // Logging module

const getRequestedCredit = async (query) => {
    try {
        logger.info(`Fetching requested credits with query: ${JSON.stringify(query)}`);

        if (!query?.status) {
            const requestedCredits = await CreditRequest.findAll();
            return { status: 200, data: requestedCredits };
        }

        const validStatuses = ["pending", "approved", "rejected"];
        if (!validStatuses.includes(query.status)) {
            return { error: "Invalid status value" };
        }

        const requestedCredits = await CreditRequest.findAll({ where: { status: query.status } });
        return { status: 200, data: requestedCredits };
    } catch (error) {
        logger.error(`Error fetching requested credits: ${error.message}`);
        return { status: 500, error: "Internal server error" };
    }
};

const approveOrRejectCredit = async (creditRequestId, status, admin_notes, amount) => {
    try {
        logger.info(`Processing credit request (ID: ${creditRequestId}) with status: ${status}`);

        const creditRequest = await CreditRequest.findOne({ where: { request_id: creditRequestId } });
        if (!creditRequest) {
            return { error: "Credit request not found" };
        }
        if (creditRequest.status !== "pending") {
            return { error: "Credit request is already processed" };
        }

        const credit = await Credit.findOne({ where: { user_id: creditRequest.user_id } });
        if (!credit) {
            return { error: "User credit account not found" };
        }

        if (status === "approved") {
            if (amount > credit.limit_credit) {
                return { error: "Credit limit exceeded, increase the limit first" };
            }
            credit.current_balance += amount;
            creditRequest.full_filled_amount = amount;
        }

        creditRequest.status = status;
        creditRequest.response_date = new Date();
        creditRequest.admin_notes = admin_notes || "No admin notes provided";

        await Promise.all([credit.save(), creditRequest.save()]);

        logger.info(`Credit request (ID: ${creditRequestId}) updated successfully`);
        return { status: 200, message: "Credit request updated successfully" };
    } catch (error) {
        logger.error(`Error updating credit request: ${error.message}`);
        return { status: 500, error: "Internal server error" };
    }
};

export default { getRequestedCredit, approveOrRejectCredit };
