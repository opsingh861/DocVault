import addDocumentService from "../../services/scan.service.js";

const addDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        if (!req.body.title) return res.status(400).json({ error: "No title provided" });

        const { title } = req.body;
        const user_id = req.user.userId;

        // Call service without passing current_balance
        const { newDocument, remaining_credits } = await addDocumentService(req.file, user_id, title);

        res.json({
            message: "Document added successfully",
            document_id: newDocument.document_id,
            remaining_credits, // Send updated credit balance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { addDocument };
