# CogniForge

CogniForge is a full-stack AI conversational application that combines a React frontend with an Express backend, MongoDB persistence, and Google Gemini-powered responses. Users can send chat prompts, maintain persistent conversation history, and clear their conversation when needed.

---

## Features

- 🤖 AI-powered chat experience using Google Gemini
- 💬 React chat interface with message list and input composer
- 💾 Persistent conversation history stored in MongoDB
- 🧠 Context-aware AI responses using stored conversation state
- 🗑️ Clear conversation functionality for the active user
- 🌐 Full-stack architecture with Express.js and Vite
- 🔒 Environment-based configuration for local development

---

## Tech Stack

### Frontend
- React
- Vite

### Backend
- Node.js
- Express.js

### Database
- MongoDB
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

```text
CogniForge/
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── .env.example
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd CogniForge
```

### 2. Install client dependencies

```bash
cd client
npm install
```

### 3. Install server dependencies

```bash
cd ../server
npm install
```

### 4. Configure environment variables

Create a `.env` file in the `server` directory based on the existing `.env.example` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
```

If the client needs a local API base URL, create a `.env` file in the `client` directory using the example file as a template and set `VITE_API_URL` as needed.

### 5. Start the backend

```bash
cd server
npm run dev
```

### 6. Start the frontend

```bash
cd client
npm run dev
```

The frontend should run locally with Vite, while the backend runs via Express and communicates with MongoDB and Gemini.

---

## API Endpoints

### Get conversation history

```http
GET /chat/:userID
```

Returns the stored message history for the specified user.

### Send a message

```http
POST /chat
```

Request body:

```json
{
  "userID": "user-123",
  "prompt": "Hello!"
}
```

Stores the user message, generates an AI response, and saves both to MongoDB.

### Clear conversation history

```http
DELETE /chat/:userID
```

Deletes the saved conversation for the specified user.

---

## Author

**Rohan Nayak**

GitHub: https://github.com/rohannayak032