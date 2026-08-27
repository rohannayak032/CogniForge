const Conversation = require("../models/Conversation");
const { randomUUID } = require("crypto");

/**
 * Derive a title from text by taking the first sentence or first 50 characters.
 * @param {string} text - The text to derive title from
 * @returns {string} - The derived title
 */
function deriveTitle(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return "New conversation";
    }

    const maxLength = 50;

    // Try to get first sentence
    let title = text.split(/[.!?]/)[0].trim();

    // If first sentence is empty, use the text as-is
    if (title.length === 0) {
        title = text.trim();
    }

    // Truncate if too long
    if (title.length > maxLength) {
        title = title.substring(0, maxLength).trim();
        // Trim to last complete word
        const lastSpace = title.lastIndexOf(' ');
        if (lastSpace > 0) {
            title = title.substring(0, lastSpace);
        }
    }

    return title.trim() || "New conversation";
}

/**
 * Create a new conversation for a user.
 * @param {string} userID - The user ID
 * @param {string} title - Optional title for the conversation
 * @returns {Promise<Object>} - The created conversation with { conversationID, title, createdAt }
 */
async function createConversation(userID, title = null) {
    if (!userID) {
        throw new Error("userID is required");
    }

    const conversationID = randomUUID();
    const conversationTitle = title || "New conversation";

    const conversation = await Conversation.create({
        userID,
        conversationID,
        title: conversationTitle,
        messages: []
    });

    return {
        conversationID: conversation.conversationID,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
    };
}

/**
 * Get all conversations for a user, sorted by most recently updated.
 * @param {string} userID - The user ID
 * @returns {Promise<Array>} - Array of conversations with metadata
 */
async function getConversations(userID) {
    if (!userID) {
        throw new Error("userID is required");
    }

    const conversations = await Conversation.find({ userID })
        .sort({ updatedAt: -1 })
        .select("conversationID title messages createdAt updatedAt")
        ;

    const migratedConversations = await Promise.all(
        conversations.map((conversation) => (
            conversation.conversationID
                ? conversation
                : migrateLegacyRecord(conversation)
        ))
    );

    return migratedConversations.map(conv => ({
        conversationID: conv.conversationID,
        title: conv.title,
        messageCount: conv.messages ? conv.messages.length : 0,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
    }));
}

/**
 * Get a specific conversation by conversationID.
 * @param {string} conversationID - The conversation ID
 * @returns {Promise<Object>} - The full conversation document
 */
async function getConversation(conversationID, userID = null) {
    if (!conversationID) {
        throw new Error("conversationID is required");
    }

    const filter = { conversationID };
    if (userID) {
        filter.userID = userID;
    }

    const conversation = await Conversation.findOne(filter);

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    return conversation;
}

/**
 * Resolve a requested conversation for its owner, or preserve the legacy
 * user-scoped behavior by migrating and returning the user's latest record.
 */
async function getOrCreateConversation(userID, conversationID = null) {
    if (!userID) {
        throw new Error("userID is required");
    }

    if (conversationID) {
        return getConversation(conversationID, userID);
    }

    const conversations = await Conversation.find({ userID }).sort({ updatedAt: -1 });
    if (conversations.length > 0) {
        return conversations[0].conversationID
            ? conversations[0]
            : migrateLegacyRecord(conversations[0]);
    }

    const created = await createConversation(userID);
    return getConversation(created.conversationID, userID);
}

/**
 * Add a message to a conversation. Auto-derives title from first user message.
 * @param {string} conversationID - The conversation ID
 * @param {string} role - "user" or "assistant"
 * @param {string} text - The message text
 * @returns {Promise<void>}
 */
async function addMessage(conversationID, role, text) {
    if (!conversationID) {
        throw new Error("conversationID is required");
    }
    if (!role || !text) {
        throw new Error("role and text are required");
    }

    const conversation = await getConversation(conversationID);

    const message = {
        role,
        text
    };

    conversation.messages.push(message);

    // Enforce 20-message limit (keep most recent)
    if (conversation.messages.length > 20) {
        conversation.messages.shift();
    }

    // Auto-derive title from first user message if title is still default
    if (role === "user" && conversation.title === "New conversation" && conversation.messages.length === 1) {
        conversation.title = deriveTitle(text);
    }

    conversation.markModified("messages");
    await conversation.save();
}

/**
 * Preserve the legacy clear-chat endpoint while conversations are separate.
 */
async function clearConversation(userID) {
    const conversation = await getOrCreateConversation(userID);
    conversation.messages = [];
    await conversation.save();
}

/**
 * Delete a conversation (hard delete).
 * @param {string} conversationID - The conversation ID
 * @returns {Promise<Object>} - Delete result
 */
async function deleteConversation(conversationID) {
    if (!conversationID) {
        throw new Error("conversationID is required");
    }

    const result = await Conversation.deleteOne({ conversationID });

    if (result.deletedCount === 0) {
        throw new Error("Conversation not found");
    }

    return result;
}

async function deleteConversationForUser(conversationID, userID) {
    if (!userID) {
        throw new Error("userID is required");
    }

    const result = await Conversation.deleteOne({ conversationID, userID });
    if (result.deletedCount === 0) {
        throw new Error("Conversation not found");
    }

    return result;
}

/**
 * MIGRATION HELPER: Handle legacy Conversation records that lack conversationID/title.
 * This is used during Step 2 API implementation to safely migrate old data.
 *
 * Legacy records have structure: { userID, messages, createdAt, updatedAt }
 * This function will be called if a record is found with conversationID == undefined.
 *
 * @param {Object} legacyDoc - The legacy Conversation document
 * @returns {Promise<Object>} - The migrated conversation with conversationID and title
 */
async function migrateLegacyRecord(legacyDoc) {
    if (!legacyDoc || !legacyDoc._id) {
        throw new Error("A legacy conversation document is required");
    }

    if (legacyDoc.conversationID) {
        return legacyDoc;
    }

    // Generate new conversationID for this legacy record
    const conversationID = randomUUID();

    // Derive title from first message if available
    let title = "Migrated conversation";
    if (legacyDoc.messages && legacyDoc.messages.length > 0) {
        const firstUserMessage = legacyDoc.messages.find(m => m.role === 'user');
        if (firstUserMessage && firstUserMessage.text) {
            title = deriveTitle(firstUserMessage.text);
        }
    }

    // Update the document with new fields
    const migrated = await Conversation.findByIdAndUpdate(
        legacyDoc._id,
        { conversationID, title },
        { new: true }
    );

    return migrated;
}

module.exports = {
    deriveTitle,
    createConversation,
    getConversations,
    getConversation,
    getOrCreateConversation,
    addMessage,
    clearConversation,
    deleteConversation,
    deleteConversationForUser,
    migrateLegacyRecord
};