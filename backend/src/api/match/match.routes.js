import express from 'express';
import findSimilarDocuments from './match.controller.js';

const router = express.Router();

router.get('/:docId', findSimilarDocuments);

export default router;