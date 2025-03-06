import findSimilarDocumentsService from "../../services/match.service.js";

export const findSimilarDocuments = async (req, res) => {
  try {
    if (!req.params.docId) return res.status(400).json({ error: "No docId provided" });

    const result = await findSimilarDocumentsService(req.params.docId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};