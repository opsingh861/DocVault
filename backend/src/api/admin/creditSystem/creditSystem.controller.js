import creditSystemService from "../../../services/admin/creditSystem.service.js";

const getRequestedCredit = async (req, res, next) => {
    try {
        const query = req.query;
        console.log("Query received:", query);

        const requestedCredit = await creditSystemService.getRequestedCredit(query);

        if (requestedCredit.error) {
            return res.status(400).json({ message: requestedCredit.error });
        }
        return res.status(200).json(requestedCredit);
    } catch (error) {
        console.error("Error in getRequestedCredit:", error);
        next(error);
    }
};

const approveOrRejectCredit = async (req, res, next) => {
    try {
        const { creditRequestId, status, admin_notes, amount } = req.body;

        if (!creditRequestId || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (status !== "approved" && status !== "rejected") {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updatedCreditRequest = await creditSystemService.approveOrRejectCredit(creditRequestId, status, admin_notes, amount);

        if (updatedCreditRequest.error) {
            return res.status(400).json({ message: updatedCreditRequest.error });
        }
        return res.status(200).json({ message: "Credit request updated successfully" });
    } catch (error) {
        console.error("Error in approveOrRejectCredit:", error);
        next(error);
    }
};

export { getRequestedCredit, approveOrRejectCredit };
