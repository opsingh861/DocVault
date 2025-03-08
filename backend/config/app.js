import express from 'express';
import session from 'express-session';
import SQLiteStore from 'connect-sqlite3';
import cookieParser from 'cookie-parser';
import authRouter from '../src/api/auth/auth.routes.js';
import requestLogger from '../src/middlewares/logging.middleware.js';
import errorHandler from '../src/middlewares/error.middleware.js';
import scanRouter from '../src/api/scan/scan.routes.js';
import matchRouter from '../src/api/match/match.routes.js';
import creditRouter from '../src/api/credit/creditRequest.routes.js';
import { authenticateUser, isAdmin } from '../src/middlewares/auth.middleware.js';
import adminRouter from "../src/api/admin/admin.routes.js";
import profileRouter from "../src/api/profile/profile.routes.js";

const app = express();
const SQLiteStoreInstance = SQLiteStore(session);

// Session middleware
app.use(
    session({
        store: new SQLiteStoreInstance({ db: 'sessions.sqlite' }),
        secret: process.env.SESSION_SECRET || 'supersecret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60 * 24 
        }
    })
);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/scan', authenticateUser, scanRouter);
app.use('/matches', authenticateUser, matchRouter);
app.use('/credits', authenticateUser, creditRouter);
app.use('/admin', authenticateUser, isAdmin, adminRouter);
app.use('/profile', authenticateUser, profileRouter);

// Error handling middleware
app.use(errorHandler);

export default app;