require("dotenv").config();
const connectDB = require("./config/db");
connectDB();

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

const chatRoutes = require("./routes/chatRoutes");
const documentRoutes = require("./routes/documentRoutes");

app.use(chatRoutes);
app.use(documentRoutes);

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