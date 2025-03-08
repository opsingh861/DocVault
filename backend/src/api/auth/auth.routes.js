import express from 'express';
import authController from './auth.controller.js';
import { authenticateUser } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authenticateUser, authController.logout);

export default router;
