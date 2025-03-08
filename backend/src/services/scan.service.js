import fs from "fs";
import path from "path";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import logger from "../utils/logger.js";
import getEmbedding from "../utils/getEmbedding.js";
import { pc, indexName } from "../utils/pineconeSetup.js";
import { db } from "../utils/database.js";
import Document from "../model/document.model.js";
import DocumentEmbedding from "../model/documentEmbedding.model.js";
import Credit from "../model/credit.model.js";

const addDocument = async (file, user_id, title) => {
    let storagePath = null;
    const transaction = await db.transaction();

    try {
        if (!file || !user_id || !title) {
            throw new Error("Missing required parameters");
        }

        // Read file content
        const text = fs.readFileSync(file.path, "utf-8");
        const documentHash = crypto.createHash("sha256").update(text).digest("hex");
        const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
        storagePath = path.join("uploads", uniqueFileName);
        fs.mkdirSync(path.dirname(storagePath), { recursive: true });
        fs.renameSync(file.path, storagePath);

        // Fetch user credit balance
        const userCredit = await Credit.findOne({ where: { user_id }, transaction });
        if (!userCredit || userCredit.current_balance <= 0) {
            throw new Error("Insufficient credits.");
        }

        // Store document in DB
        const newDocument = await Document.create(
            { user_id, title, path: storagePath, content: text, file_size: file.size, document_hash: documentHash },
            { transaction }
        );

        // Generate and store embedding
        const embedding = await getEmbedding(text);
        await DocumentEmbedding.create(
            { document_id: newDocument.document_id, embedding: JSON.stringify(embedding) },
            { transaction }
        );

        // Add to Pinecone index
        await pc.index(indexName).upsert([
            {
                id: newDocument.document_id.toString(),
                values: embedding,
                metadata: { user_id, title, document_hash: documentHash },
            },
        ]);

        // Deduct 1 credit
        userCredit.current_balance -= 1;
        await userCredit.save({ transaction });

        await transaction.commit();
        logger.info(`Document ${newDocument.document_id} added. Remaining credits: ${userCredit.current_balance}`);

        return { newDocument, remaining_credits: userCredit.current_balance };
    } catch (error) {
        await transaction.rollback();
        logger.error(`Error in addDocumentService: ${error.stack}`);

        if (storagePath && fs.existsSync(storagePath)) {
            try {
                fs.unlinkSync(storagePath);
                logger.info(`Rolled back file storage: ${storagePath}`);
            } catch (cleanupError) {
                logger.error(`Failed to clean up file: ${cleanupError}`);
            }
        }

        throw new Error(`Document addition failed: ${error.message}`);
    }
};

export default { addDocument };
