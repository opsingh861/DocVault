import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const db = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

const connectDB = async () => {
    try {
        await db.authenticate();
        console.log('Database connected successfully.');

        // Sync models
        await db.sync({ force: false });
        console.log('Database synced.');

    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

export { db, connectDB };
