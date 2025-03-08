import express from 'express';
import creditSystemRouter from "./creditSystem/creditSystem.routes.js"

const router = express.Router();

router.use('/creditsystem', creditSystemRouter);

export default router;