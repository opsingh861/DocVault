import express from 'express';
import { findSimilarDocuments } from './match.controller.js';
import { authenticateUser } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:docId', authenticateUser, findSimilarDocuments);

export default router;