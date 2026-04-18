# Skillentrix Project Tracker

A refined full-stack Project and Task Tracking System built for the Skillentrix internship assignment using a React + Vite frontend and an Express backend with MongoDB support.

## Highlights

- Clean dashboard UI for project and task management
- Full CRUD flow for projects and tasks
- Task status tracking with `Pending`, `In Progress`, and `Completed`
- Backend health check endpoint for quick verification
- MongoDB support with in-memory fallback for restricted environments
- Responsive layout suitable for GitHub submission and project demo

## Tech Stack

- Frontend: React 19, Vite, CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose

## Project Structure

```text
skillentrix-project-tracker/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── store/
│   ├── package.json
│   └── server.js
├── public/
├── src/
│   ├── components/
│   ├── App.jsx
│   ├── index.css
│   └── index.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Run Locally

### Frontend

```bash
npm install
npm run dev
```

The frontend runs on Vite and proxies `/api` requests to the backend in development.

### Backend

```bash
cd backend
npm install
npm start
```

## Environment Setup

Create `backend/.env` with:

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/skillentrix-task-tracker
```

You can also use a MongoDB Atlas connection string instead of the local URI.

## API Endpoints

- `GET /api/health`
- `GET /api/projects`
- `POST /api/projects`
- `DELETE /api/projects/:id`
- `GET /api/tasks/:projectId`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Verification

Recommended checks:

```bash
npm run lint
npm run build
```

If you want to confirm the backend is live:

```bash
curl http://localhost:5001/api/health
```

## GitHub Upload

From the project root:

```bash
git init
git add .
git commit -m "Refine Skillentrix project tracker"
git branch -M main
git remote add origin https://github.com/your-username/your-repo-name.git
git push -u origin main
```

## Submission Note

For screenshots, recording, or viva, run the backend with a real MongoDB connection so the project demonstrates persistent data clearly.
