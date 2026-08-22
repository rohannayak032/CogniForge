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
        unique: true
    },
    messages: [messageSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model("Conversation", conversationSchema);