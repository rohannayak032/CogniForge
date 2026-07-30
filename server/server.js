require("dotenv").config();
const connectDB = require("./config/db");
connectDB();
console.log(process.env.GEMINI_API_KEY);

const express = require("express");

const app = express();
app.use(express.json());

const PORT = 5000;

const chatRoutes = require("./routes/chatRoutes");

app.use(chatRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to CogniForge API!",
        version: "1.0.0"
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});