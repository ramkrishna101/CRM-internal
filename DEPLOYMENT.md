# Deployment Guide

This project is a full-stack application with a React frontend, NestJS backend, and PostgreSQL database.

## Recommended Free Service: Render.com

Render offers a free tier for Web Services (Backend), Static Sites (Frontend), and PostgreSQL (Database).

### Prerequisites
1. Push your code to a GitHub repository.
2. Create an account on [Render.com](https://render.com).

### Step 1: Database (PostgreSQL)
1. On Render dashboard, click **New +** -> **PostgreSQL**.
2. Name: `crm-db` (or similar).
3. Region: Choose one close to you (e.g., Frankfurt, Oregon).
4. Plan: **Free**.
5. Click **Create Database**.
6. Once created, copy the **Internal DB URL** (for backend if deployed on Render) and **External DB URL** (for local testing).

### Step 2: Backend (NestJS)
1. Click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. **Root Directory**: `server`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm run start:prod`
6. **Environment Variables**:
   - `DATABASE_URL`: Paste the **Internal DB URL** from Step 1.
   - `JWT_SECRET`: Set a secure secret key (e.g., `my-secret-key-123`).
   - `PORT`: `3000` (Render usually sets this automatically, but good to have).
   - `FRONTEND_URL`: You will set this *after* deploying the frontend (Step 3). For now, leave it or set to `http://localhost:5173`.
7. Click **Create Web Service**.
8. Wait for deployment. Copy the **Service URL** (e.g., `https://crm-backend.onrender.com`).

### Step 3: Frontend (React)
1. Click **New +** -> **Static Site**.
2. Connect your GitHub repository.
3. **Root Directory**: `client`
4. **Build Command**: `npm install && npm run build`
5. **Publish Directory**: `dist`
6. **Environment Variables**:
   - `VITE_API_URL`: Paste the **Backend Service URL** from Step 2 (e.g., `https://crm-backend.onrender.com`).
7. Click **Create Static Site**.
8. Wait for deployment. Copy the **Site URL** (e.g., `https://crm-frontend.onrender.com`).

### Step 4: Final Configuration
1. Go back to your **Backend Web Service** settings on Render.
2. Update the `FRONTEND_URL` environment variable to your new **Frontend Site URL** (e.g., `https://crm-frontend.onrender.com`).
3. Render will automatically redeploy the backend.

### Done!
Your application should now be live.

---

## Alternative: Railway.app (Trial)
Railway is easier to set up but the free tier is a trial.
1. Login to Railway.
2. Create a new project -> Deploy from GitHub repo.
3. Add a PostgreSQL database service.
4. Configure variables similar to above.

## Local Development
To run locally with the production build:
1. Backend: `cd server && npm run build && npm run start:prod`
2. Frontend: `cd client && npm run build && npm run preview`
