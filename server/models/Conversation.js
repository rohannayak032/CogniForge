const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    }
});

const conversationSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        index: true
    },
    conversationID: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        default: "New conversation"
    },
    messages: [messageSchema]
}, {
    timestamps: true
});

// Compound index for efficient querying by userID + sorting by updatedAt
conversationSchema.index({ userID: 1, updatedAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);