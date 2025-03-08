import authService from "../../services/auth.service.js";
import logger from "../../utils/logger.js";

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await authService.loginUser(req, username, password);

        logger.info(`User ${user.username} (ID: ${user.userId}) logged in.`);
        res.status(200).json({
            message: "Login successful",
            username: user.username,
            name: user.name,
            role: user.role,
        });
    } catch (error) {
        logger.error(`Login failed for user ${req.body.username}: ${error.message}`);
        next(error);
    }
};

const register = async (req, res, next) => {
    try {
        const { name, username, password } = req.body;
        const user = await authService.registerUser(req, name, username, password);

        logger.info(`New user registered: ${user.username} (ID: ${user.userId})`);
        res.status(201).json({
            message: "User registered successfully",
            name: user.name,
            username: user.username,
            role: user.role,
        });
    } catch (error) {
        if (error.message === "Username already exists") {
            logger.warn(`Registration failed: ${error.message}`);
            return res.status(409).json({ error: error.message });
        }
        logger.error(`Registration failed: ${error.message}`);
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        await authService.logoutUser(req);
        logger.info(`User ${req.session?.user?.username || "Unknown"} logged out.`);
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        logger.error(`Logout failed: ${error.message}`);
        next(error);
    }
};

export default { login, register, logout };
