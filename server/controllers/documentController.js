const mongoose = require("mongoose");
const Document = require("../models/Document");
const DocumentChunk = require("../models/DocumentChunk");
const { extractPdfChunks } = require("../services/pdfService");
const { generateChunkEmbeddings } = require("../services/embeddingService");
const { retrieveSimilarChunks } = require("../services/retrievalService");
const { generateGroundedResponse } = require("../services/geminiService");

function isValidDocumentID(documentID) {
    return mongoose.Types.ObjectId.isValid(documentID);
}

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

async function searchDocuments(req, res) {
    const { userID, query, topK } = req.body;

    if (!userID || !query?.trim()) {
        return res.status(400).json({
            success: false,
            message: "userID and query are required"
        });
    }

    try {
        const chunks = await retrieveSimilarChunks(userID, query.trim(), topK);
        return res.json({
            success: true,
            chunks
        });
    } catch (error) {
        console.error(error);
        const isIndexError = error.message?.includes("Vector Search index");
        return res.status(isIndexError ? 503 : 500).json({
            success: false,
            message: isIndexError ? error.message : "Unable to search document chunks"
        });
    }
}

async function askDocuments(req, res) {
    const { userID, query, topK, documentID } = req.body;

    if (!userID || !query?.trim()) {
        return res.status(400).json({
            success: false,
            message: "userID and query are required"
        });
    }

    try {
        if (documentID && !isValidDocumentID(documentID)) {
            return res.status(400).json({
                success: false,
                message: "documentID must be a valid document ID"
            });
        }

        const chunks = await retrieveSimilarChunks(userID, query.trim(), topK, documentID);
        const context = chunks.map((chunk, index) => (
            `[Source ${index + 1}] ${chunk.documentName} | page ${chunk.pageNumber} | chunk ${chunk.chunkIndex}\n${chunk.text}`
        )).join("\n\n");
        const answer = await generateGroundedResponse(context, query.trim());
        const seenSources = new Set();
        const sources = chunks.filter((chunk) => {
            const sourceKey = `${chunk.documentId}:${chunk.pageNumber}:${chunk.chunkIndex}`;
            if (seenSources.has(sourceKey)) {
                return false;
            }
            seenSources.add(sourceKey);
            return true;
        }).map((chunk) => ({
            documentName: chunk.documentName,
            documentId: chunk.documentId?.toString(),
            pageNumber: chunk.pageNumber,
            chunkIndex: chunk.chunkIndex,
            score: chunk.score
        }));

        return res.json({
            success: true,
            answer,
            sources
        });
    } catch (error) {
        console.error(error);
        const isIndexError = error.message?.includes("Vector Search index");
        return res.status(isIndexError ? 503 : 500).json({
            success: false,
            message: isIndexError ? error.message : "Unable to generate an answer from document context"
        });
    }
}

async function listDocuments(req, res) {
    const { userID } = req.params;

    if (!userID) {
        return res.status(400).json({ success: false, message: "userID is required" });
    }

    try {
        const documents = await Document.find({ userID })
            .select("_id originalName mimeType size pageCount status createdAt updatedAt")
            .sort({ createdAt: -1 })
            .lean();
        return res.json({ success: true, documents });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Unable to list documents" });
    }
}

async function deleteDocument(req, res) {
    const { documentID } = req.params;
    const { userID } = req.body;

    if (!userID || !isValidDocumentID(documentID)) {
        return res.status(400).json({
            success: false,
            message: "userID and a valid documentID are required"
        });
    }

    try {
        const document = await Document.findOne({ _id: documentID, userID }).select("_id").lean();
        if (!document) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }

        await DocumentChunk.deleteMany({ documentId: document._id });
        await Document.deleteOne({ _id: document._id, userID });
        return res.json({ success: true, message: "Document deleted" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Unable to delete document" });
    }
}

module.exports = { uploadDocument, searchDocuments, askDocuments, listDocuments, deleteDocument };