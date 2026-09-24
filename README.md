# Frontend (React + Tailwind CSS)

## Setup

Install dependencies:

```bash
cd frontend
npm install
```

## Environment variables

Create `frontend/.env` (not committed) and copy values from `.env.example`:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

## Run

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

## Build

```bash
npm run build
```

## Features

- **Authentication**: Login, Register, JWT token management
- **Courses**: Browse and view course details
- **Dashboard**: User dashboard with stats
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Protected Routes**: Route protection for authenticated users
- **API Integration**: Full integration with backend API

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- React Icons

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── common/     # Button, Input, Card
│   │   └── layout/      # Header, Footer, Layout
│   ├── context/         # React Context (AuthContext)
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   ├── utils/          # Helper functions
│   ├── styles/         # Global styles
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Static assets
├── package.json
└── vite.config.js
```
