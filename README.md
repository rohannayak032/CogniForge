# CogniForge

CogniForge is a full-stack AI workspace for focused conversations, learning, and problem solving. It combines a React and Vite client with an Express API, MongoDB persistence, and Google Gemini responses.

![CogniForge Chat Demo](./screenshots/screenshot.png)

## Features

- Gemini-powered AI conversations
- Full-screen React AI workspace
- Persistent conversation history with MongoDB
- Context-aware conversations
- Conversation clearing
- Light and dark themes
- Suggested prompts
- Responsive interface
- Environment-based configuration

## Tech Stack

- **Frontend:** React, Vite, plain CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **AI:** Google Gemini API, `@google/genai`
- **Configuration:** `dotenv`

## Project Structure

```text
CogniForge/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   └── utils/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── README.md
```

## Installation and Setup

### 1. Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Configure the server

Create `server/.env` using `server/.env.example`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
CLIENT_URL=http://localhost:5173
```

The client reads `VITE_API_URL` when provided. Otherwise, it uses the current origin and the local Vite proxy for `/chat` requests.

### 3. Start the application

Start the backend in one terminal:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

## API Endpoints

### Get conversation history

```http
GET /chat/:userID
```

### Send a message

```http
POST /chat
```

```json
{
  "userID": "user-123",
  "prompt": "Hello!"
}
```

### Clear conversation history

```http
DELETE /chat/:userID
```