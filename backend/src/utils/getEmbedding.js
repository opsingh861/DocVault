import OpenAI from "openai";
import logger from "./logger.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate embedding for a given text
async function getEmbedding(text) {
    // Validate input
    if (!text || typeof text !== 'string' || text.trim() === '') {
        throw new Error("Invalid input: text must be a non-empty string");
    }

    try {
        // Truncate very long text to avoid API limits
        const truncatedText = text.length > 8192 
            ? text.slice(0, 8192) 
            : text;

        const response = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: truncatedText,
        });

        // Careful extraction of embedding
        const embedding = response.data[0]?.embedding;

        // Comprehensive validation
        if (!embedding) {
            throw new Error("No embedding returned from OpenAI");
        }

        // Detailed logging for debugging
        logger.info('Embedding generation details', {
            embeddingType: typeof embedding,
            embeddingLength: embedding.length,
            firstFewValues: embedding.slice(0, 5)
        });

        // Ensure exactly 1536 dimensions
        if (embedding.length !== 1536) {
            // If shorter, pad with zeros
            if (embedding.length < 1536) {
                const paddedEmbedding = [
                    ...embedding,
                    ...Array(1536 - embedding.length).fill(0)
                ];
                logger.warn(`Padded embedding from ${embedding.length} to 1536 dimensions`);
                return paddedEmbedding;
            }
            // If longer, truncate
            if (embedding.length > 1536) {
                const truncatedEmbedding = embedding.slice(0, 1536);
                logger.warn(`Truncated embedding from ${embedding.length} to 1536 dimensions`);
                return truncatedEmbedding;
            }
        }

        // Validate each element is a number and convert to float
        const processedEmbedding = embedding.map(val => {
            const floatVal = Number(val);
            if (isNaN(floatVal)) {
                throw new Error("Embedding contains invalid values");
            }
            return floatVal;
        });

        return processedEmbedding;
    } catch (error) {
        // Detailed error logging
        logger.error("Embedding generation failed", {
            errorMessage: error.message,
            errorStack: error.stack,
            inputTextLength: text.length
        });

        // Re-throw to be handled by caller
        throw error;
    }
}

export default getEmbedding;