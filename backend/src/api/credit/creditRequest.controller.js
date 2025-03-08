import creditRequestService from "../../services/creditRequest.service.js";

const requestCredit = async (req, res, next) => {
    try {
        const { amount, reason } = req.body;

        if (amount === undefined || amount === null) throw new Error("No amount provided");
        if (amount < 0) throw new Error("Invalid amount");

        const user_id = req.session.user?.userId;
        if (!user_id) throw new Error("Unauthorized: User ID missing");

        const requestedCredit = await creditRequestService.requestCredit(amount, reason, user_id);

        res.status(201).json({
            message: "Credit requested successfully",
            requested_credit: requestedCredit.requested_amount
        });

    } catch (error) {
        next(error); // Pass error to middleware
    }
};

export default requestCredit 
