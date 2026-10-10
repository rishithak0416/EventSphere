# EventSphere — Online Event Registration Platform

A student-friendly MERN-stack project starter for managing college events and registrations.

## Features
- Browse events
- Register a participant for an event
- View registrations for an event
- Admin form to add events (demo-level; secure admin authentication is not included in this deadline-friendly starter)
- MongoDB persistence when configured
- Demo mode with sample events if MongoDB is not configured

## Requirements
- Node.js LTS and npm
- MongoDB Atlas account (recommended) or local MongoDB
- Git

## Run locally

### 1. Start the backend
```bash
cd server
npm install
```
Copy `.env.example` to `.env` and set `MONGODB_URI` if you have MongoDB Atlas. Then:
```bash
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Start the frontend in a second terminal
```bash
cd client
npm install
npm run dev
```
Open the local URL printed by Vite, usually `http://localhost:5173`.

The frontend uses `VITE_API_URL` and defaults to `http://localhost:5000/api`.

## Deploy
- Backend: Render or another Node.js host. Set `MONGODB_URI` and `CLIENT_ORIGIN`.
- Frontend: Vercel or Netlify. Set `VITE_API_URL` to your deployed backend URL plus `/api`.
- MongoDB: create a MongoDB Atlas database and allow the deployed backend IP/network access according to Atlas guidance.
- After deployment, test registration and event creation on the public URL.

## Important
This is an academic demo starter, not a production-ready ticketing system. Add proper admin authentication, validation, rate limiting and access controls before real-world use.
