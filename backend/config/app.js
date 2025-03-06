import express from 'express';
import session from 'express-session';
import SQLiteStore from 'connect-sqlite3';
import cookieParser from 'cookie-parser';
import authRouter from '../src/api/auth/auth.routes.js';
import requestLogger from '../src/middlewares/logging.middleware.js';
import errorHandler from '../src/middlewares/error.middleware.js';
import scanRouter from '../src/api/scan/scan.routes.js';
import matchRouter from '../src/api/match/match.routes.js';
import { authenticateUser } from '../src/middlewares/auth.middleware.js';

const app = express();
const SQLiteStoreInstance = SQLiteStore(session);

// Session middleware
app.use(
    session({
        store: new SQLiteStoreInstance({ db: 'sessions.sqlite' }), // Store sessions in SQLite
        secret: process.env.SESSION_SECRET || 'supersecret', // Keep secret in env file
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false, // Set true if using HTTPS
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }
    })
);

// app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/scan', authenticateUser, scanRouter);
app.use('/matches', matchRouter);

// Error handling middleware
app.use(errorHandler);

export default app;
