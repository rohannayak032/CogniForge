const Document = require("../models/Document");
const DocumentChunk = require("../models/DocumentChunk");
const { extractPdfChunks } = require("../services/pdfService");
const { generateChunkEmbeddings } = require("../services/embeddingService");

async function uploadDocument(req, res) {
    const userID = req.body.userID;

    if (!userID) {
        return res.status(400).json({
            success: false,
            message: "userID is required"
        });
    }

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "A PDF file is required"
        });
    }

    const isPdf = req.file.mimetype === "application/pdf" &&
        req.file.buffer.subarray(0, 5).toString() === "%PDF-";

    if (!isPdf) {
        return res.status(400).json({
            success: false,
            message: "Only valid PDF files are supported"
        });
    }

    let document;

    try {
        document = await Document.create({
            userID,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            pageCount: 0,
            status: "processing"
        });

        const { pageCount, chunks } = await extractPdfChunks(req.file.buffer);
        const chunksWithEmbeddings = await generateChunkEmbeddings(chunks);

        if (chunksWithEmbeddings.length) {
            await DocumentChunk.insertMany(chunksWithEmbeddings.map((chunk) => ({
                ...chunk,
                userID,
                documentId: document._id,
                documentName: req.file.originalname
            })));
        }

        document.pageCount = pageCount;
        document.status = "ready";
        await document.save();

        return res.status(201).json({
            success: true,
            document,
            chunkCount: chunksWithEmbeddings.length
        });
    } catch (error) {
        if (document) {
            await DocumentChunk.deleteMany({ documentId: document._id });
            await Document.deleteOne({ _id: document._id });
        }

        console.error(error);
        return res.status(422).json({
            success: false,
            message: "Unable to process the PDF and generate embeddings"
        });
    }
}

module.exports = { uploadDocument };