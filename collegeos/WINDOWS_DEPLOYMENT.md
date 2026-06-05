# Windows Deployment Guide for CollegeOS

Complete deployment guide for Windows users.

## Prerequisites

- Git for Windows: https://git-scm.com/download/win
- Node.js & npm: https://nodejs.org/ (LTS version)
- PowerShell 7+ (built-in Windows Terminal)
- GitHub account: https://github.com
- Neon account: https://neon.tech
- Render account: https://render.com  
- Vercel account: https://vercel.com

### Check Prerequisites

Open PowerShell and run:

```powershell
git --version
node --version
npm --version
```

If any fail, install the missing tool.

---

## Local Setup First (Optional but Recommended)

Before deploying, test locally to ensure everything works.

### 1. Clone Repository

```powershell
git clone https://github.com/YOUR-USERNAME/collegeos.git
cd collegeos
```

### 2. Set Up Backend Locally

```powershell
cd backend
npm install
```

Create `backend\.env`:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your-development-secret-key-here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Build and test:

```powershell
npm run build
npm start
```

Backend should run on `http://localhost:3000`

### 3. Set Up Frontend Locally

```powershell
cd ../frontend
npm install
```

Create `frontend\.env.local`:

```
VITE_API_URL=http://localhost:3000
```

Start development:

```powershell
npm run dev
```

Frontend should run on `http://localhost:5173`

### 4. Test Locally

- Open http://localhost:5173 in browser
- Should auto-create user and load dashboard
- Check browser console for errors (F12)
- Test loading some pages

If everything works locally, proceed to cloud deployment.

---

## Cloud Deployment (Neon, Render, Vercel)

### STEP 1: Create Neon Database

1. Open https://console.neon.tech
2. Click **"Create project"**
3. Choose PostgreSQL 15+
4. Click **"Create project"**
5. Go to **"Connection string"** tab
6. Copy the connection string (save in notepad)
7. Go to **"SQL Editor"**
8. Open `collegeos\database\schema.sql` in a text editor
9. Copy all SQL and paste into Neon SQL Editor
10. Click **"Execute"** and verify success
11. **Keep the connection string ready** ← Important!

### STEP 2: Deploy Backend on Render

1. Push your code to GitHub:

```powershell
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. Open https://render.com

3. Click **"New +"** → **"Web Service"**

4. Click **"Connect a repository"**

5. Authorize GitHub and select your `collegeos` repo

6. Fill in the form:

```
Name: collegeos-backend
Branch: main
Region: Oregon (or closest to you)
Build Command: cd backend && npm install && npm run build
Start Command: cd backend && npm start
```

7. Click **"Advanced"** and add Environment Variables:

```
DATABASE_URL = (paste from Neon)
JWT_SECRET = (generate with PowerShell command below)
NODE_ENV = production
CLIENT_URL = (you'll add this later)
```

To generate JWT_SECRET in PowerShell:

```powershell
# Copy and paste this entire line:
[Convert]::ToBase64String([byte[]](1..32 | ForEach-Object {Get-Random -Maximum 256})) | Set-Clipboard; Write-Host "Copied to clipboard!"
```

8. Click **"Create Web Service"**

9. **Wait 3-5 minutes** for deployment

10. You'll see a URL like: `https://collegeos-backend.onrender.com`

11. **Copy this URL** ← Important!

12. Test it works: Open `https://your-backend-url.onrender.com/health`

### STEP 3: Deploy Frontend on Vercel

1. Open https://vercel.com

2. Click **"Add New"** → **"Project"**

3. Click **"Import Git Repository"**

4. Select your `collegeos` repository

5. Fill form:

```
Project Name: collegeos-frontend
Framework: Vite (auto-detect)
Root Directory: ./frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

6. Click **"Environment Variables"** and add:

```
VITE_API_URL = (paste your Render backend URL from Step 2)
```

7. Click **"Deploy"**

8. **Wait 1-2 minutes** for deployment

9. You'll get a URL like: `https://collegeos-frontend.vercel.app`

10. **Copy this URL** ← Important!

11. Test it: Open `https://your-frontend-url.vercel.app`

### STEP 4: Update Render with Frontend URL

1. Go back to https://render.com

2. Click on **`collegeos-backend`** service

3. Click **"Environment"** in left menu

4. Find `CLIENT_URL` variable

5. Update it to your Vercel URL from Step 3

6. Click **"Save Changes"**

7. Service will redeploy (1-2 minutes)

---

## Verify Deployment

### Test Backend

Open PowerShell and run:

```powershell
# Replace with your Render URL
$backendUrl = "https://your-backend-url.onrender.com"
Invoke-WebRequest "$backendUrl/health" | Select-Object StatusCode
```

Should return: `StatusCode: 200`

### Test Frontend

1. Open your Vercel URL in browser
2. App should load
3. Auto-user-creation should trigger
4. Dashboard should appear
5. Open DevTools (F12) → Console
6. No red errors should appear

### Check API Communication

1. In browser, press F12 (DevTools)
2. Go to **"Network"** tab
3. Refresh page
4. Look for requests to your backend URL
5. Should see `/api/auth/status` with 200 status

---

## Making Updates

### After Code Changes

```powershell
# From repository root
git add .
git commit -m "Your message"
git push origin main
```

Then:
- **Backend** auto-deploys on Render (wait 2-3 minutes)
- **Frontend** auto-deploys on Vercel (wait 1-2 minutes)

### Check Deployment Status

- **Render**: https://render.com/dashboard
- **Vercel**: https://vercel.com/dashboard

### View Logs

**Render**:
1. Click `collegeos-backend`
2. Click **"Logs"** tab
3. Scroll to see deployment progress and errors

**Vercel**:
1. Click your project
2. Click **"Deployments"**
3. Click latest deployment
4. See build logs

---

## Troubleshooting

### Backend shows "Error during installation"

**In Render Logs**, look for:

```
npm ERR! ...
```

**Solution**:
1. Test locally: `cd backend && npm install && npm run build`
2. Fix any errors
3. Push to GitHub
4. Redeploy on Render

### Frontend shows "API Error" or "Network Error"

**Check**:
1. Render backend is running (test `/health`)
2. `VITE_API_URL` is correct (no trailing slash)
3. Backend `CLIENT_URL` matches Vercel URL

**In browser DevTools**:
1. Go to **Network** tab
2. Look for failed requests to backend
3. Check response for error message

### Database connection failed

**Check Neon**:
1. Is database still running? (Check Neon dashboard)
2. Test connection from Neon SQL Editor

**In Render**:
1. Check `DATABASE_URL` is correct
2. Check it has `?sslmode=require`

**Solution**:
1. Copy fresh connection string from Neon
2. Update on Render
3. Redeploy

### CORS Error in console

```
Access-Control-Allow-Origin header is missing
```

**Check**:
1. Is `CLIENT_URL` set on Render to your Vercel URL?
2. Is backend redeployed? (wait 1-2 minutes)

**Solution**:
1. Go to Render → `collegeos-backend` → Environment
2. Verify `CLIENT_URL` matches Vercel URL exactly
3. Click "Save Changes"
4. Wait for redeployment

### App stuck on loading screen

**Check**:
1. Browser Console for errors (F12)
2. Network tab for failed requests
3. Vercel/Render logs for backend errors

**Common causes**:
- Backend URL wrong or offline
- Database connection failed
- JWT_SECRET not set

---

## Useful PowerShell Commands

### Test Backend Connectivity

```powershell
$url = "https://your-backend-url.onrender.com/health"
Invoke-WebRequest $url
```

### View Environment Variables (Stored Locally)

```powershell
Get-ChildItem env: | Where-Object {$_.Name -like "VITE*"}
```

### Generate Random Secret

```powershell
[Convert]::ToBase64String([byte[]](1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

### Clone and Setup in One Command

```powershell
git clone https://github.com/YOUR-USERNAME/collegeos.git
cd collegeos
cd backend && npm install && cd ../frontend && npm install
```

---

## URLs to Bookmark

- **Neon Console**: https://console.neon.tech
- **Render Dashboard**: https://render.com/dashboard  
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub**: https://github.com/YOUR-USERNAME/collegeos

---

## Estimated Timeline

| Task | Time |
|------|------|
| Create Neon database | 5 min |
| Deploy backend on Render | 8 min |
| Deploy frontend on Vercel | 5 min |
| Update backend CLIENT_URL | 2 min |
| Verification | 3 min |
| **Total** | **~25 minutes** |

---

## Next Steps

1. ✅ Follow this guide to deploy
2. ✅ Test the live app
3. ✅ Monitor logs for errors
4. ✅ Share the Vercel URL with others
5. ✅ Set up automatic backups on Neon
6. ✅ Add custom domain (optional)

---

## Support

If you encounter issues:

1. Check the error message in logs
2. Search the troubleshooting section above
3. Check [DEPLOYMENT.md](DEPLOYMENT.md) for details
4. Review browser DevTools console (F12)

Good luck! 🚀

