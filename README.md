# CogniForge

CogniForge is a full-stack AI workspace for focused conversations, learning, and problem solving. It combines a React and Vite client with an Express API, MongoDB persistence, and Google Gemini responses.

## Live Demo

[Open the CogniForge live demo](https://cogniforge-f4oq.onrender.com)

![CogniForge Chat Demo](./screenshots/screenshot.png)

## Features

- Gemini-powered AI conversations
- Full-screen React AI workspace
- Persistent conversation history with MongoDB
- Context-aware conversations
- PDF document upload and text extraction
- Document chunking and semantic embeddings
- Conversation clearing
- Light and dark themes
- Suggested prompts
- Responsive interface
- Environment-based configuration
- PDF document upload and text extraction
- Document chunking and semantic embeddings
- MongoDB Atlas Vector Search retrieval
- User-scoped document retrieval

## Document Processing

CogniForge supports PDF document ingestion and semantic retrieval.

Uploaded PDFs are:

1. Extracted page-by-page
2. Split into smaller text chunks
3. Converted into semantic embeddings using Google Gemini
4. Stored in MongoDB with document and page metadata
5. Retrieved using MongoDB Atlas Vector Search based on semantic similarity

Document retrieval is scoped by user, ensuring that users only retrieve content from their own uploaded documents.

## Tech Stack

### Frontend

- React
- Vite
- Plain CSS

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### AI

- Google Gemini API
- `@google/genai`

### Configuration

- `dotenv`

## Project Structure

```text
CogniForge/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
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
├── screenshots/
│   └── screenshot.png
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/rohannayak032/CogniForge.git
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

Create `server/.env` using `server/.env.example`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
RAG_TOP_K=5
CLIENT_URL=http://localhost:5173
```

Optionally, create `client/.env` and set the API base URL:

```env
VITE_API_URL=http://localhost:5000
```

When `VITE_API_URL` is not provided, the Vite development proxy handles `/chat` requests.

### 5. Start the backend

```bash
cd server
npm run dev
```

### 6. Start the frontend

In another terminal:

```bash
cd client
npm run dev
```

## API Endpoints

### Get conversation history

`GET /chat/:userID` — retrieve conversation history.

### Send a message

`POST /chat` — send a message and generate a Gemini response.

Request body:

```json
{
  "userID": "user-123",
  "prompt": "Hello!"
}
```

### Clear conversation history

`DELETE /chat/:userID` — clear conversation history.

### Ask a question about uploaded documents

`POST /documents/ask` — retrieve user-scoped document chunks and generate a grounded Gemini answer.

Request body:

```json
{
  "userID": "user-123",
  "query": "What is a primary key?"
}
```

The response includes the answer and deduplicated source metadata for the retrieved chunks. `topK` may be supplied in the request body; otherwise `RAG_TOP_K` is used.

## Deployment

CogniForge is deployed as separate frontend and backend services using:

- React + Vite frontend
- Node.js + Express backend
- MongoDB Atlas
- Google Gemini API

The frontend communicates with the deployed Express API through `VITE_API_URL`.

## Author

**Rohan Nayak**

[GitHub repository](https://github.com/rohannayak032/CogniForge)