# CollegeOS Deployment Guide

Complete guide to deploy CollegeOS on Render (backend), Vercel (frontend), and Neon (database).

## Prerequisites

1. GitHub repository (public or private) with the code pushed
2. Neon account at https://neon.tech
3. Render account at https://render.com
4. Vercel account at https://vercel.com

---

## Step 1: Set Up Database on Neon

### 1.1 Create a Neon Project

1. Go to https://console.neon.tech
2. Click **"Create project"**
3. Choose PostgreSQL version 15+
4. Name it `collegeos` (or your preferred name)
5. Click **Create project**

### 1.2 Get Database Connection String

1. In the Neon dashboard, go to **Connection string**
2. Copy the PostgreSQL connection string (looks like: `postgresql://user:password@host/dbname?sslmode=require`)
3. Save this securely - you'll need it for both Render and Vercel

### 1.3 Create Database Schema

1. In Neon dashboard, click **SQL Editor**
2. Create a new query and paste the schema from `collegeos/database/schema.sql`
3. Execute it
4. Verify tables are created in the **Tables** tab

---

## Step 2: Deploy Backend on Render

### 2.1 Connect GitHub Repository

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Select **"Connect a repository"**
4. Authorize GitHub and select your repository
5. Select the `collegeos` repository

### 2.2 Configure Web Service

In the Render form, fill in:

- **Name**: `collegeos-backend`
- **Environment**: `Node`
- **Region**: Select closest to your users
- **Branch**: `main` (or your main branch)
- **Build Command**: 
  ```bash
  cd backend && npm install && npm run build
  ```
- **Start Command**: 
  ```bash
  cd backend && npm run start
  ```

### 2.3 Add Environment Variables

Click **"Advanced"** → **"Environment"** and add:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app
```

Replace:
- `DATABASE_URL` with your Neon connection string
- `JWT_SECRET` with a strong random key (use: `openssl rand -base64 32`)
- `CLIENT_URL` with your Vercel frontend URL (deploy frontend first to get this)

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment to complete (3-5 minutes)
3. Copy the deployment URL (e.g., `https://collegeos-backend.onrender.com`)
4. Save this - you'll need it for Vercel

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Connect Repository

1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository

### 3.2 Configure Project

In the Vercel import form:

- **Project name**: `collegeos-frontend` (or `collegeos`)
- **Framework**: `Vite`
- **Root directory**: `./frontend`

### 3.3 Add Environment Variables

Click **"Environment Variables"** and add:

```
VITE_API_URL=https://your-backend-url.onrender.com
```

Replace with your Render backend URL from Step 2.4

### 3.4 Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

These should be auto-detected for Vite. If not, set them manually.

### 3.5 Deploy

1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. You'll get a URL like `https://collegeos-frontend.vercel.app`

---

## Step 4: Update Render with Frontend URL

Now that you have the Vercel URL:

1. Go back to https://render.com
2. Open your `collegeos-backend` web service
3. Click **"Environment"**
4. Update `CLIENT_URL` to your Vercel URL
5. Click **"Save Changes"**
6. The service will redeploy automatically

---

## Step 5: Verify Deployment

### Test Backend Health

Visit: `https://your-backend-url.onrender.com/health`

Should return: `{"status":"ok"}`

### Test Frontend

Visit: `https://your-frontend-url.vercel.app`

Should load the app. Auto-setup should trigger and create a user.

### Test API Connection

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for requests to `/auth/status` - should succeed
5. Check **Console** for any errors

---

## Troubleshooting

### Backend Won't Deploy

**Issue**: Build fails with "module not found"

**Solution**:
- Check `backend/package.json` has all dependencies
- Ensure `tsconfig.json` is correct
- Run locally: `cd backend && npm run build`

### Frontend Won't Load Data

**Issue**: 404 errors for API requests

**Solution**:
1. Check `VITE_API_URL` matches your Render backend URL exactly
2. Verify backend CORS settings (should allow your Vercel domain)
3. Check browser console for actual error message

### Database Connection Failed

**Issue**: Backend crashes with database error

**Solution**:
1. Verify `DATABASE_URL` is correct in Render environment
2. Test connection in Neon dashboard
3. Check if database schema was created (see Step 1.3)

### CORS Errors

**Issue**: Frontend can't reach backend

**Solution**:
Update `backend/src/config/cors.ts`:
```typescript
const allowedOrigins = [
  'https://your-frontend-url.vercel.app',
  'http://localhost:5173'
];
```

---

## Redeploy After Changes

### Backend Changes

1. Push to GitHub
2. Render auto-deploys (if enabled)
3. Or manually redeploy from Render dashboard

### Frontend Changes

1. Push to GitHub
2. Vercel auto-deploys
3. Takes 1-2 minutes

### Database Schema Changes

1. Update `database/schema.sql`
2. Execute new queries in Neon SQL Editor
3. Or set up migrations (advanced)

---

## Environment Variables Reference

### Neon
- `DATABASE_URL` - PostgreSQL connection string
- (no other vars needed for database)

### Render (Backend)
- `DATABASE_URL` - From Neon
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- `NODE_ENV` - Set to `production`
- `CLIENT_URL` - Your Vercel frontend URL

### Vercel (Frontend)
- `VITE_API_URL` - Your Render backend URL

---

## Production Checklist

- [ ] Database created and schema applied
- [ ] Backend deployed on Render with all env vars
- [ ] Frontend deployed on Vercel with API URL
- [ ] Backend's CLIENT_URL updated to Vercel URL
- [ ] Backend `/health` endpoint responds
- [ ] Frontend loads and auto-creates user
- [ ] API calls succeed in browser
- [ ] No CORS errors in console
- [ ] Database connections from Neon working

