import Credit from "../model/credit.model.js";

const creditCheck = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const user_id = req.user.userId;

    try {
        const credit = await Credit.findOne({ where: { user_id } });
        if (!credit) {
            return res.status(403).json({ error: 'Credit not found' });
        }

        if (credit.current_balance < 0) {
            return res.status(403).json({ error: 'Insufficient credit' });
        }

        req.credit = credit;
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
    next();
};

export default creditCheck;