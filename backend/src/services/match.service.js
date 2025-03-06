import { pc, indexName } from "../utils/pineconeSetup.js";
import Document from "../model/document.model.js";
import DocumentEmbedding from "../model/documentEmbedding.model.js";

export const findSimilarDocumentsService = async (docId) => {
    try {

        const doc = await DocumentEmbedding.findOne({
            where: { document_id: docId },
        });
        let queryEmbedding;
        try {
            queryEmbedding = Array.isArray(doc.embedding) ? doc.embedding : JSON.parse(doc.embedding);
        } catch (e) {
            console.error("Embedding retrieval error:", e);
            throw new Error("Failed to process embedding");
        }

        const index = pc.Index(indexName);
        const k = 3; // Return top 3 similar docs

        const queryResult = await index.query({
            vector: queryEmbedding,
            topK: k,
            includeMetadata: true,
        });

        const similarDocs = (
            await Promise.all(
                queryResult.matches.map(async (match) => {
                    const doc = await Document.findByPk(match.id);
                    if (match.score < 0.80) return null; // Ignore low similarity scores

                    if (!doc || doc.document_id == docId) return null;
                    return {
                        id: doc.document_id,
                        title: doc.title,
                        content: doc.content.substring(0, 200),
                        path: doc.path,
                        similarity_score: match.score,
                    };
                })
            )
        ).filter(Boolean);

        return { similar_documents: similarDocs };
    } catch (error) {
        console.error("Error finding similar documents:", error);
        throw new Error("Failed to retrieve similar documents");
    }
};

export default findSimilarDocumentsService;
