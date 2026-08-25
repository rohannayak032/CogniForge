const mongoose = require("mongoose");

const documentChunkSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        index: true
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true,
        index: true
    },
    documentName: {
        type: String,
        required: true
    },
    chunkIndex: {
        type: Number,
        required: true
    },
    pageNumber: {
        type: Number,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    embedding: {
        type: [Number],
        default: undefined
    }
}, {
    timestamps: true
});

documentChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });

module.exports = mongoose.model("DocumentChunk", documentChunkSchema);