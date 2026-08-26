const mongoose = require("mongoose");
const DocumentChunk = require("../models/DocumentChunk");
const { generateEmbedding } = require("./embeddingService");

const DEFAULT_TOP_K = 5;
const MAX_TOP_K = 20;
const VECTOR_INDEX_NAME = "document_chunks_vector_index";

function getTopK(value) {
    if (value === undefined) {
        return Number(process.env.RAG_TOP_K) || DEFAULT_TOP_K;
    }

    const topK = Number(value);
    if (!Number.isInteger(topK) || topK < 1) {
        throw new Error("topK must be a positive integer");
    }

    return Math.min(topK, MAX_TOP_K);
}

async function retrieveSimilarChunks(userID, query, requestedTopK, documentID) {
    let documentObjectId;
    if (documentID) {
        if (!mongoose.Types.ObjectId.isValid(documentID)) {
            throw new Error("documentID must be a valid document ID");
        }

        documentObjectId = new mongoose.Types.ObjectId(documentID);
    }

    const queryVector = await generateEmbedding(query);
    const topK = getTopK(requestedTopK);
    const filter = { userID: { $eq: userID } };

    if (documentObjectId) {
        filter.documentId = { $eq: documentObjectId };
    }

    try {
        return await DocumentChunk.aggregate([
            {
                $vectorSearch: {
                    index: VECTOR_INDEX_NAME,
                    path: "embedding",
                    queryVector,
                    numCandidates: Math.max(topK * 10, 50),
                    limit: topK,
                    filter
                }
            },
            {
                $project: {
                    _id: 0,
                    documentId: 1,
                    documentName: 1,
                    pageNumber: 1,
                    chunkIndex: 1,
                    text: 1,
                    score: { $meta: "vectorSearchScore" }
                }
            }
        ]);
    } catch (error) {
        if (error.message?.includes(VECTOR_INDEX_NAME)) {
            throw new Error(`MongoDB Vector Search index '${VECTOR_INDEX_NAME}' is missing or unavailable`);
        }

        throw error;
    }
}

module.exports = { retrieveSimilarChunks, VECTOR_INDEX_NAME };