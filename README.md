# Zeth Dashboard

A beautiful dark-themed analytics dashboard for tracking AI assistant (Zeth) token usage, task categories, time spent, and activity history.

## Features

- 📊 Token usage analytics by category (pie, bar, line charts)
- 📝 Activity log with pagination and category filtering
- ➕ Manual log entry via modal form
- 🔴 Real-time stats: total tokens, tasks, most active category
- 🌙 Gorgeous dark theme with orange accent

## Tech Stack

- **Frontend**: React + Vite, Recharts, TailwindCSS → Vercel
- **Backend**: Node.js + Express REST API → port 3002
- **Database**: MongoDB Atlas

## Running the Backend

```bash
cd backend
cp .env.example .env
# Fill in MONGODB_URI in .env
npm install
npm start
```

Backend runs at `http://localhost:3002`

## Running the Frontend (dev)

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:3002 npm run dev
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/logs | List all logs (desc, limit 100) |
| POST | /api/logs | Create a new log entry |
| GET | /api/stats | Aggregated stats |
| DELETE | /api/logs/:id | Delete a log entry |

## Seeding Sample Data

```bash
cd backend
node seed.js
```
