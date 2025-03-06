import express from "express";
import multer from "multer";
import { addDocument } from "./scan.controller.js";
import creditCheck from "../../middlewares/creditCheck.middleware.js"; // Import credit check middleware

const router = express.Router();

// Configure Multer to store files
const storage = multer.diskStorage({
    destination: "uploads/", // Ensure this folder exists
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage: storage });

// Ensure all checks before proceeding
router.post("/", creditCheck, upload.single("file"), addDocument);

export default router;
