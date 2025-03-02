import bcrypt from 'bcrypt';
import User from "../model/user.model.js";
import Credit from '../model/credit.model.js';

const loginUser = async (req, username, password) => {
    const user = await User.findOne({ where: { username } });
    if (!user) {
        throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hashed);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }

    // Store user data in session
    req.session.user = {
        userId: user.user_id,
        username: user.username,
        role: user.role
    };

    return user;
};

const registerUser = async (req, username, password) => {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
        throw new Error('Username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
        username,
        password_hashed: passwordHash,
        role: 'user'
    });

    // Initialize credits for the new user
    await Credit.create({
        user_id: user.user_id,
        current_balance: 20,
        limit_credit: 20
    });

    // Store user info in session (auto-login after registration)
    req.session.user = {
        userId: user.user_id,
        username: user.username,
        role: user.role
    };

    return user;
};

const logoutUser = async (req) => {
    return new Promise((resolve, reject) => {
        req.session.destroy((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

const authService = {
    loginUser,
    registerUser,
    logoutUser
};

export default authService;
