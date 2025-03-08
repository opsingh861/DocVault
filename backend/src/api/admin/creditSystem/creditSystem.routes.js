import express from 'express';
import { approveOrRejectCredit, getRequestedCredit } from './creditSystem.controller.js';

const router = express.Router();

router.get('/getcreditrequests', getRequestedCredit);
router.patch('/managerequest', approveOrRejectCredit);

export default router