const express = require("express");
const router = express.Router();

const { chat, getChat, clearChat } = require("../controllers/chatController");

router.get("/chat/:userID", getChat);
router.post("/chat", chat);
router.delete("/chat/:userID", clearChat);

module.exports = router;