import scanService from "../../services/scan.service.js";

const addDocument = async (req, res, next) => {
    try {
        if (!req.file) throw new Error("No file uploaded");
        if (!req.body.title) throw new Error("No title provided");

        const { title } = req.body;
        const user_id = req.user.userId;

        // Call service without passing current_balance
        const { newDocument, remaining_credits } = await scanService.addDocument(req.file, user_id, title);

        res.status(201).json({
            message: "Document added successfully",
            document_id: newDocument.document_id,
            remaining_credits, // Send updated credit balance
        });
    } catch (error) {
        next(error); // Pass error to middleware
    }
};

export { addDocument };
