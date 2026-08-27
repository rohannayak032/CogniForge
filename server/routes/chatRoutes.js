const express = require("express");
const router = express.Router();

const {
	chat,
	getChat,
	clearChat,
	createConversationController,
	listOrGetConversations,
	getConversationController,
	deleteConversationController
} = require("../controllers/chatController");

router.post("/chat/conversations", createConversationController);
router.get("/chat/conversations/:userID", listOrGetConversations);
router.delete("/chat/conversations/:conversationID", deleteConversationController);
router.get("/chat/:userID", getChat);
router.post("/chat", chat);
router.delete("/chat/:userID", clearChat);

module.exports = router;