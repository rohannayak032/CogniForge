const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        index: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["processing", "ready", "failed"],
        default: "processing"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Document", documentSchema);