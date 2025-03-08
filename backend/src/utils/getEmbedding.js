import OpenAI from "openai";
import logger from "./logger.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getEmbedding(text) {
    if (!text || typeof text !== 'string' || text.trim() === '') {
        throw new Error("Invalid input: text must be a non-empty string");
    }

    try {
        const truncatedText = text.length > 8192 ? text.slice(0, 8192) : text;

        const response = await openai.embeddings.create({
            model: "text-embedding-3-small", 
            input: truncatedText,
        });

        const embedding = response.data[0]?.embedding;
        if (!embedding) throw new Error("No embedding returned from OpenAI");

        return embedding;
    } catch (error) {
        logger.error("Embedding generation failed", { errorMessage: error.message });
        throw error;
    }
}

export default getEmbedding;
