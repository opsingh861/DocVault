const validateRegistration = (req, res, next) => {
    const { username, password } = req.body;

    if (!username || username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    next(); // Validation passed, continue to controller
};

export { validateRegistration };