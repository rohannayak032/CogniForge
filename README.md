# CogniForge

CogniForge is an AI-powered conversational backend that integrates Google Gemini with MongoDB to deliver context-aware conversations with persistent memory. The application stores conversation history, allowing users to continue previous chats seamlessly.

---

## Features

- 🤖 AI-powered conversations using Google Gemini
- 💾 Persistent conversation memory with MongoDB Atlas
- 🧠 Context-aware responses using stored chat history
- 🗑️ Clear conversation history endpoint
- 🌐 RESTful API built with Express.js
- 🔒 Environment variable configuration using dotenv

---

## Tech Stack

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### AI
- Google Gemini API
- @google/genai

### Development Tools
- Git
- GitHub
- Nodemon
- Postman

---

## Project Structure

```
CogniForge
│
├── client/                 # React frontend (Under Development)
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/CogniForge.git
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Create a `.env` file

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
```

### 4. Start the development server

```bash
npm run dev
```

---

## API Endpoints

### Chat

```
POST /chat
```

Generate an AI response while storing the conversation in MongoDB.

### Clear Conversation

```
DELETE /chat/:userID
```

Deletes all stored messages for the specified user.

---

## Current Status

✅ Backend API completed

✅ MongoDB integration

✅ Persistent conversation memory

✅ Google Gemini integration

🚧 React frontend under development

---

## Future Improvements

- React frontend
- Multiple conversations
- User authentication
- Markdown support
- PDF summarization
- AI code review
- Conversation search
- File upload support

---

## Author

**Rohan Nayak**

GitHub: https://github.com/rohannayak032