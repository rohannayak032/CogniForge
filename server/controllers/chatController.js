const { generateResponse } = require("../services/geminiService");
const { getConversation, addMessage, clearConversation } = require("../services/conversationService");

async function chat(req, res) {
    const userID = req.body.userID;
    const prompt = req.body.prompt;
    if (!userID || !prompt) {
        return res.status(400).json({
            success: false,
            message: "userID and prompt are required"
        });
    }
    try {
        await addMessage(userID, "user", prompt);
        const history = await getConversation(userID);
        const reply = await generateResponse(history);
        await addMessage(userID, "assistant", reply);
        res.json({
            reply: reply,
        });
    } catch (error) {
        console.error(error);
        let message = error.message;
        try {
            const parsed = JSON.parse(error.message);
            message = parsed.error.message;
        } catch {}
        res.status(500).json({
            success: false,
            message,
        });
    }
}

async function clearChat(req, res) {
    try {
        const userID = req.params.userID;
        await clearConversation(userID);
        res.json({
            success: true,
            message: "Conversation cleared"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = { chat, clearChat }