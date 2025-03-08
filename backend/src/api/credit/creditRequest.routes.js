import { Router } from "express";
import requestCredit from "./creditRequest.controller.js";
const router = Router();

router.post('/request', requestCredit);

export default router;