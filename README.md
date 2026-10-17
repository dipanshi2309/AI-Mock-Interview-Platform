# AI Mock Interview Platform

An AI-powered mock interview platform designed to help users practise interviews and improve their interview preparation.
Features

- User registration and login
- Interview setup and practice
- Interview session management
- AI-generated questions and feedback (when the AI service is configured)

## Tech Stack

**Frontend:** React.js, Vite  
**Backend:** Node.js, Express.js  
**Database:** MongoDB  
**Authentication:** JWT and bcrypt

## Project Structure

```text
mock-ai-interview/
├── backend/
└── frontend/
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/dipanshi2309/AI-Mock-Interview-Platform.git
cd AI-Mock-Interview-Platform
```

### 2. Start the backend

```bash
cd backend
npm install
npm run dev
```

### 3. Start the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the frontend terminal.

## Configuration

Configure the required environment variables in `backend/.env` before using database persistence or external AI services. Never commit API keys or secrets.

## Author

Dipanshi Srivastava
