const Conversation = require("../models/Conversation");
async function getConversation(userID) {
    let conversation = await Conversation.findOne({ userID });
    if (!conversation) {
        conversation = await Conversation.create({
            userID,
            messages: []
        });
    }
    return conversation;
}

async function addMessage(userID, role, text){
    const conversation = await getConversation(userID)

    const message = {
        role,
        text
    };

    conversation.messages.push(message);

    if(conversation.messages.length>20){
        conversation.messages.shift();
    }
    await conversation.save();
}

async function clearConversation(userID) {
    await Conversation.deleteOne({ userID });
}

module.exports = {getConversation, addMessage, clearConversation};