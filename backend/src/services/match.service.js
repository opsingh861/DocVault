import { pc, indexName } from "../utils/pineconeSetup.js";
import Document from "../model/document.model.js";
import DocumentEmbedding from "../model/documentEmbedding.model.js";
import MatchResult from "../model/match.model.js";
import logger from "../utils/logger.js";

// Cosine similarity calculation
function cosineSimilarity(vec1, vec2) {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const normA = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (normA * normB);
}

const findSimilarDocumentsService = async (docId) => {
    try {
        logger.info(`Searching for similar documents to docId: ${docId}`);

        // ✅ Check if results are already cached in the DB
        const cachedMatches = await MatchResult.findAll({ where: { document_id: docId } });

        if (cachedMatches.length > 0) {
            logger.info(`Returning cached matches for docId: ${docId}`);
            return {
                similar_documents: cachedMatches.map(match => ({
                    id: match.matched_document_id,
                    title: match.matched_document_title,
                    similarity_score: match.similarity_score,
                }))
            };
        }

        // ✅ Fetch the document embedding
        const doc = await DocumentEmbedding.findOne({ where: { document_id: docId } });
        if (!doc) throw new Error(`Document embedding not found for docId: ${docId}`);

        // ✅ Fetch the actual document details
        const docDetails = await Document.findOne({ where: { document_id: docId } });
        if (!docDetails) throw new Error(`Document not found for docId: ${docId}`);

        let queryEmbedding;
        try {
            queryEmbedding = Array.isArray(doc.embedding) ? doc.embedding : JSON.parse(doc.embedding);
        } catch (e) {
            logger.error(`Embedding retrieval error for docId ${docId}: ${e.stack}`);
            throw new Error("Failed to process embedding");
        }

        // ✅ Query Pinecone
        const index = pc.Index(indexName);
        const k = 3;
        const queryResult = await index.query({
            vector: queryEmbedding,
            topK: k,
            includeMetadata: true,
        });

        const similarDocs = [];

        for (const match of queryResult.matches) {
            if (match.score < 0.80) continue;

            // ✅ Fetch matched document details
            const matchedDoc = await Document.findByPk(match.id);
            if (!matchedDoc || matchedDoc.document_id == docId) continue;

            // ✅ Compute cosine similarity for verification
            const matchedEmbedding = await DocumentEmbedding.findOne({ where: { document_id: matchedDoc.document_id } });
            if (!matchedEmbedding) continue;

            const matchedEmbeddingVector = JSON.parse(matchedEmbedding.embedding);
            const cosineSim = cosineSimilarity(queryEmbedding, matchedEmbeddingVector);
            if (cosineSim < 0.80) continue;

            // ✅ Ensure matched document title is properly retrieved
            if (!matchedDoc.title) {
                logger.error(`Document title is missing for document_id: ${matchedDoc.document_id}`);
                continue; // Skip this match
            }

            // ✅ Store matches in DB (BIDIRECTIONAL)
            await MatchResult.findOrCreate({
                where: { document_id: docId, matched_document_id: matchedDoc.document_id },
                defaults: {
                    similarity_score: match.score.toFixed(2),
                    match_type: "pinecone",
                    matched_document_title: matchedDoc.title
                }
            });

            await MatchResult.findOrCreate({
                where: { document_id: matchedDoc.document_id, matched_document_id: docId },
                defaults: {
                    similarity_score: match.score.toFixed(2),
                    match_type: "pinecone",
                    matched_document_title: docDetails.title // ✅ Ensure original doc title is stored
                }
            });

            logger.info(`Added match: ${matchedDoc.document_id} (Title: ${matchedDoc.title}) with score: ${match.score}`);

            similarDocs.push({
                id: matchedDoc.document_id,
                title: matchedDoc.title,
                similarity_score: match.score.toFixed(2),
            });
        }

        logger.info(`Returning ${similarDocs.length} similar documents for docId: ${docId}`);
        return { similar_documents: similarDocs };
    } catch (error) {
        logger.error(`Error finding similar documents for docId ${docId}: ${error.stack}`);
        throw new Error("Failed to retrieve similar documents");
    }
};

export default findSimilarDocumentsService;
