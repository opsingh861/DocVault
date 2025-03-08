import findSimilarDocumentsService from "../../services/match.service.js";

const findSimilarDocuments = async (req, res, next) => {
  try {
    const { docId } = req.params;
    if (!docId) throw new Error("No docId provided");

    const result = await findSimilarDocumentsService(docId);
    res.json(result);
  } catch (error) {
    next(error); // Pass error to middleware
  }
};

export default findSimilarDocuments;
