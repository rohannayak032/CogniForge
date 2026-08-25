const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function generateEmbedding(text) {
    try {
        const response = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: text
        });
        const embedding = response.embeddings?.[0]?.values;

        if (!Array.isArray(embedding) || embedding.length === 0) {
            throw new Error("Gemini returned an empty embedding");
        }

        return embedding;
    } catch (error) {
        const message = error?.message || "Unknown Gemini embedding error";
        throw new Error(`Failed to generate embedding: ${message}`);
    }
}

async function generateChunkEmbeddings(chunks) {
    const chunksWithEmbeddings = [];

    for (const chunk of chunks) {
        const embedding = chunk.embedding || await generateEmbedding(chunk.text);
        chunksWithEmbeddings.push({
            ...chunk,
            embedding
        });
    }

    return chunksWithEmbeddings;
}

module.exports = { generateChunkEmbeddings };