import User from "../src/model/user.model.js";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const registerUser = async (name, username, password) => {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
        throw new Error('Username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
        name,
        username,
        password_hashed: passwordHash,
        role: 'admin'
    });

    return user;
};

const name = process.env.ADMIN_NAME;
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

registerUser(name, username, password)
    .then(user => {
        console.log('Admin user created');
        console.log(user);
    })
    .catch(error => {
        console.error('Error creating admin user', error);
    });
