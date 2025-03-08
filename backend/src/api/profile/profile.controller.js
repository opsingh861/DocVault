import profileService from "../../services/profile.service.js";

const getUserData = async (req, res, next) => {
    try {
        const user_id = req.user.userId;
        const data = await profileService.getUserData(user_id);
        res.status(200).json(data);
    } catch (error) {
        next(error); // Pass error to middleware
    }
};

const getPreviousScans = async (req, res, next) => {
    try {
        const user_id = req.user.userId;
        const scans = await profileService.getPreviousScans(user_id);
        res.status(scans.status).json(scans);
    } catch (error) {
        next(error);
    }
};

const getCreditRequestHistory = async (req, res, next) => {
    try {
        const user_id = req.user.userId;
        const creditHistory = await profileService.getCreditRequestHistory(user_id);
        res.status(creditHistory.status).json(creditHistory);
    } catch (error) {
        next(error);
    }
};

export { getUserData, getPreviousScans, getCreditRequestHistory };
