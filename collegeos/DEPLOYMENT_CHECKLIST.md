# CollegeOS Quick Deployment Checklist

A quick reference for deploying on Render, Vercel, and Neon.

## Quick Links

- **Neon Console**: https://console.neon.tech
- **Render Dashboard**: https://render.com
- **Vercel Dashboard**: https://vercel.com
- **GitHub**: https://github.com

---

## 5-Step Deployment Process

### ✅ Step 1: Prepare Neon Database (10 minutes)

- [ ] Create Neon project at https://console.neon.tech
- [ ] Get PostgreSQL connection string
- [ ] Run this SQL in Neon SQL Editor:
  ```sql
  -- Copy entire contents of: collegeos/database/schema.sql
  -- Paste into SQL Editor and Execute
  ```
- [ ] Verify tables exist in "Tables" tab
- [ ] **Copy connection string** - you'll need it next

### ✅ Step 2: Deploy Backend on Render (8 minutes)

**Setup**:
- [ ] Go to https://render.com → "New +" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Fill form:
  - Name: `collegeos-backend`
  - Branch: `main`
  - Build Command: `cd backend && npm install && npm run build`
  - Start Command: `cd backend && npm start`

**Environment Variables**:
- [ ] Click "Advanced" → "Environment"
- [ ] Add these variables:
  - `DATABASE_URL` = *your Neon connection string*
  - `JWT_SECRET` = *generate with: `openssl rand -base64 32`*
  - `NODE_ENV` = `production`
  - `CLIENT_URL` = *leave empty for now, update later*

- [ ] Click "Create Web Service"
- [ ] Wait for deployment (watch "Logs")
- [ ] **Copy your Render URL** (e.g., `https://collegeos-backend.onrender.com`)

### ✅ Step 3: Deploy Frontend on Vercel (5 minutes)

**Setup**:
- [ ] Go to https://vercel.com → "Add New" → "Project"
- [ ] Click "Import Git Repository"
- [ ] Select your repository

**Configuration**:
- [ ] Project Name: `collegeos-frontend`
- [ ] Framework: Select "Vite"
- [ ] Root Directory: `./frontend`

**Environment Variables**:
- [ ] Click "Environment Variables"
- [ ] Add: `VITE_API_URL` = *your Render backend URL from Step 2*
- [ ] Click "Deploy"
- [ ] Wait for deployment
- [ ] **Copy your Vercel URL** (e.g., `https://collegeos-frontend.vercel.app`)

### ✅ Step 4: Update Backend with Frontend URL (2 minutes)

- [ ] Go back to https://render.com → `collegeos-backend`
- [ ] Click "Environment"
- [ ] Update `CLIENT_URL` = *your Vercel URL from Step 3*
- [ ] Click "Save Changes"
- [ ] Wait for redeployment

### ✅ Step 5: Verify Everything Works (3 minutes)

**Test Backend**:
- [ ] Open: `https://your-backend-url.onrender.com/health`
- [ ] Should show: `{"status":"ok"}`

**Test Frontend**:
- [ ] Open: `https://your-frontend-url.vercel.app`
- [ ] App should load and auto-create a user
- [ ] Check browser DevTools console for errors

---

## Environment Variables Reference

### Backend (Render)

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=base64-encoded-32-char-string
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel)

```
VITE_API_URL=https://your-backend.onrender.com
```

### Database (Neon)

No variables needed - just connection URL

---

## Generate JWT Secret (Choose One)

### Option 1: Using Git Bash/PowerShell

```powershell
# PowerShell
$secret = [Convert]::ToBase64String([byte[]](1..32 | ForEach-Object {Get-Random -Maximum 256}))
Write-Host $secret
```

### Option 2: Using Online Tool

Visit https://www.base64encode.org/ and generate a random string

### Option 3: Manual

Just create a random 32+ character string with letters, numbers, symbols

---

## Troubleshooting

### Backend won't deploy

**Check**:
- Is `cd backend && npm run build` working locally?
- Are all required dependencies in `backend/package.json`?
- Check Render Logs for error message

**Fix**:
```bash
cd backend
npm install
npm run build
```

### Frontend won't connect to backend

**Check**:
- Is `VITE_API_URL` set correctly in Vercel?
- Does it match your Render URL exactly?
- No trailing slashes

**Fix**:
1. Go to Vercel project settings
2. Update `VITE_API_URL` 
3. Redeploy

### Database connection failed

**Check**:
- Is `DATABASE_URL` correct from Neon?
- Did you run the SQL schema?
- Is SSL working (`?sslmode=require`)?

**Fix**:
1. Copy fresh connection string from Neon
2. Update Render environment variable
3. Redeploy backend

### CORS errors in browser

**Check**:
- Is `CLIENT_URL` set to your Vercel URL?
- Is backend redeployed after setting `CLIENT_URL`?

**Fix**:
1. Set `CLIENT_URL` on Render
2. Click "Save Changes"
3. Wait for redeployment

---

## After Deployment

### Make code changes

1. Push to GitHub
2. Services auto-deploy:
   - **Backend**: Render redeploys (1-3 minutes)
   - **Frontend**: Vercel redeploys (1-2 minutes)

### Database changes

1. For schema updates: Use Neon SQL Editor
2. For data seeding: Use Neon SQL Editor or seed scripts

### Monitor deployments

- **Render**: https://render.com/dashboard
- **Vercel**: https://vercel.com/dashboard
- **Neon**: https://console.neon.tech

---

## Estimated Costs (Free Tier)

- **Neon**: Free tier available (excellent for development)
- **Render**: Free tier (runs forever, not just 15 mins like Heroku)
- **Vercel**: Free tier (perfect for frontend)

**Total Monthly Cost**: $0 for small projects 🎉

---

## Next Steps

- [ ] Visit your frontend URL and verify auto-user-creation works
- [ ] Test creating/viewing calendar events
- [ ] Check API calls in browser DevTools
- [ ] Monitor logs on Render/Vercel for errors
- [ ] Set up automatic database backups in Neon

