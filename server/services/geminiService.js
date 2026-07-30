const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
async function generateResponse(history) {
    if (history.messages.length === 0) {
        return "Hello! How can I help you today?";
    }
    const contents = history.messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : msg.role,
        parts: [
            {
                text: msg.text
            }
        ]
    }));
    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents
    });

    return response.text;
}

module.exports = {
    generateResponse,
}