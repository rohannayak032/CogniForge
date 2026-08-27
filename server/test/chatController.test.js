const assert = require("node:assert/strict");
const test = require("node:test");
const Module = require("node:module");

const calls = [];
let rejectDelete = false;
const service = {
    createConversation: async (userID, title) => ({ conversationID: "new-1", userID, title }),
    getConversations: async (userID) => [{ conversationID: "conversation-1", userID }],
    getConversation: async (conversationID, userID) => ({ conversationID, userID, messages: [] }),
    getOrCreateConversation: async (userID, conversationID) => {
        calls.push(["resolve", userID, conversationID]);
        return { conversationID: conversationID || "legacy-migrated-1", userID, messages: [] };
    },
    addMessage: async (...args) => calls.push(["add", ...args]),
    clearConversation: async () => {},
    deleteConversationForUser: async (...args) => {
        if (rejectDelete) throw new Error("Conversation not found");
        calls.push(["delete", ...args]);
    }
};

const gemini = {
    generateResponse: async () => "reply"
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
    if (request === "../services/conversationService") return service;
    if (request === "../services/geminiService") return gemini;
    return originalLoad.call(this, request, parent, isMain);
};
const controllers = require("../controllers/chatController");
Module._load = originalLoad;

function response() {
    return {
        statusCode: 200,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
}

test("conversation creation, listing, and retrieval use the expected ownership inputs", async () => {
    let res = response();
    await controllers.createConversationController({ body: { userID: "user-1", title: "Work" } }, res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.conversation.conversationID, "new-1");

    res = response();
    await controllers.listOrGetConversations({ params: { userID: "user-1" }, query: {} }, res);
    assert.deepEqual(res.body.conversations, [{ conversationID: "conversation-1", userID: "user-1" }]);

    res = response();
    await controllers.listOrGetConversations({ params: { userID: "conversation-1" }, query: { userID: "user-1" } }, res);
    assert.equal(res.body.conversation.conversationID, "conversation-1");
});

test("deletion is user-scoped", async () => {
    const res = response();
    await controllers.deleteConversationController({ params: { conversationID: "conversation-1" }, body: { userID: "owner" }, query: {} }, res);
    assert.deepEqual(calls.at(-1), ["delete", "conversation-1", "owner"]);
    assert.equal(res.body.success, true);
});

test("ownership failures return not found", async () => {
    rejectDelete = true;
    const res = response();
    const originalConsoleError = console.error;
    console.error = () => {};
    await controllers.deleteConversationController({ params: { conversationID: "other-user" }, body: { userID: "owner" }, query: {} }, res);
    console.error = originalConsoleError;
    assert.equal(res.statusCode, 404);
    rejectDelete = false;
});

test("messages target a requested conversation and legacy chats resolve safely", async () => {
    calls.length = 0;
    let res = response();
    await controllers.chat({ body: { userID: "user-1", conversationID: "conversation-1", prompt: "Hello" } }, res);
    assert.equal(res.body.conversationID, "conversation-1");
    assert.deepEqual(calls.slice(0, 2), [
        ["resolve", "user-1", "conversation-1"],
        ["add", "conversation-1", "user", "Hello"]
    ]);

    calls.length = 0;
    res = response();
    await controllers.chat({ body: { userID: "legacy-user", prompt: "Continue" } }, res);
    assert.equal(res.body.conversationID, "legacy-migrated-1");
    assert.deepEqual(calls[0], ["resolve", "legacy-user", undefined]);
});

test("chat routes load all requested route shapes", () => {
    const router = require("../routes/chatRoutes");
    const routes = router.stack.filter((layer) => layer.route).map((layer) => `${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`);
    assert.deepEqual(routes, [
        "POST /chat/conversations",
        "GET /chat/conversations/:userID",
        "DELETE /chat/conversations/:conversationID",
        "GET /chat/:userID",
        "POST /chat",
        "DELETE /chat/:userID"
    ]);
});