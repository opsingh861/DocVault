import authService from '../../services/auth.service.js';
import logger from '../../utils/logger.js';

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await authService.loginUser(req, username, password);

        logger.info(`User ${username} logged in`);
        res.status(200).json({
            message: 'Login successful',
            username: user.username,
            role: user.role
        });
    } catch (error) {
        logger.error(`Login failed: ${error.message}`);
        res.status(401).json({ error: 'Invalid credentials' });
    }
};

const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Call the service to handle business logic
        const user = await authService.registerUser(req, username, password);

        logger.info(`User ${username} registered successfully`);

        // Return response to client
        res.status(201).json({
            message: 'User registered successfully',
            username: user.username,
            role: user.role
        });
    } catch (error) {
        // Error handling
        if (error.message === 'Username already exists') {
            logger.error(`Registration failed: ${error.message}`);
            return res.status(409).json({ error: error.message });
        }
        logger.error(`Registration failed: ${error.message}`);
        res.status(500).json({ error: 'Registration failed' });
    }
};

const logout = async (req, res) => {
    try {
        await authService.logoutUser(req);
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
};

const authController = {
    login,
    register,
    logout
};

export default authController;
