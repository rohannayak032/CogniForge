const express = require("express");
const router = express.Router();

const { chat, clearChat } = require("../controllers/chatController");

router.post("/chat", chat);
router.delete("/chat/:userID", clearChat);

module.exports = router;