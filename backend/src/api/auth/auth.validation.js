const validateRegistration = (req, res, next) => {
    const { username, password, name } = req.body;

    if (!name || name.trim().length < 3) {
        return next(new Error("Name must be at least 3 characters long"));
    }

    if (!username || username.trim().length < 3) {
        return next(new Error("Username must be at least 3 characters long"));
    }

    if (!password || password.length < 6) {
        return next(new Error("Password must be at least 6 characters long"));
    }

    next(); // Validation passed, proceed to the controller
};

export { validateRegistration };
