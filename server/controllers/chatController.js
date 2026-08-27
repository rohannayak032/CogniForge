const { generateResponse } = require("../services/geminiService");
const {
    createConversation,
    getConversations,
    getConversation,
    getOrCreateConversation,
    addMessage,
    clearConversation,
    deleteConversationForUser
} = require("../services/conversationService");

function errorStatus(error) {
    return error.message === "Conversation not found" ? 404 : 500;
}

async function createConversationController(req, res) {
    const { userID, title } = req.body;
    if (!userID) {
        return res.status(400).json({ success: false, message: "userID is required" });
    }

    try {
        const conversation = await createConversation(userID, title);
        return res.status(201).json({ success: true, conversation });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function listConversations(req, res) {
    const { userID } = req.params;
    if (!userID) {
        return res.status(400).json({ success: false, message: "userID is required" });
    }

    try {
        const conversations = await getConversations(userID);
        return res.json({ success: true, conversations });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function getConversationController(req, res) {
    const conversationID = req.params.conversationID || req.params.userID;
    const userID = req.query.userID;
    if (!conversationID || !userID) {
        return res.status(400).json({ success: false, message: "conversationID and userID are required" });
    }

    try {
        const conversation = await getConversation(conversationID, userID);
        return res.json({ success: true, conversation });
    } catch (error) {
        console.error(error);
        return res.status(errorStatus(error)).json({ success: false, message: error.message });
    }
}

async function listOrGetConversations(req, res) {
    if (req.query.userID) {
        return getConversationController(req, res);
    }

    return listConversations(req, res);
}

async function deleteConversationController(req, res) {
    const { conversationID } = req.params;
    const userID = req.body.userID || req.query.userID;
    if (!conversationID || !userID) {
        return res.status(400).json({ success: false, message: "conversationID and userID are required" });
    }

    try {
        await deleteConversationForUser(conversationID, userID);
        return res.json({ success: true, message: "Conversation deleted" });
    } catch (error) {
        console.error(error);
        return res.status(errorStatus(error)).json({ success: false, message: error.message });
    }
}

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
        const conversation = await getOrCreateConversation(userID, req.body.conversationID);
        await addMessage(conversation.conversationID, "user", prompt);
        const history = await getConversation(conversation.conversationID, userID);
        const reply = await generateResponse(history);
        await addMessage(conversation.conversationID, "assistant", reply);
        res.json({
            reply: reply,
            conversationID: conversation.conversationID
        });
    } catch (error) {
        console.error(error);
        let message = error.message;
        try {
            const parsed = JSON.parse(error.message);
            message = parsed.error.message;
        } catch {}
        res.status(errorStatus(error)).json({
            success: false,
            message,
        });
    }
}

async function getChat(req, res) {
    try {
        const userID = req.params.userID;
        const conversation = await getOrCreateConversation(userID);
        res.json({ messages: conversation.messages });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
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

module.exports = {
    chat,
    getChat,
    clearChat,
    createConversationController,
    listConversations,
    listOrGetConversations,
    getConversationController,
    deleteConversationController
};