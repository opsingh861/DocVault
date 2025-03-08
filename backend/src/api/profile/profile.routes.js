import express from "express";
import { getCreditRequestHistory, getPreviousScans, getUserData } from "./profile.controller.js";

const router = express.Router();

router.get('/userdata', getUserData);
router.get('/scans', getPreviousScans);
router.get('/creditrequests', getCreditRequestHistory);

export default router;