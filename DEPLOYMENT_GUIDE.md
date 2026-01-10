# Free Deployment Guide - Vercel + Render

## Step 1: Prepare Your Code
Make sure all your changes are committed:
```bash
cd c:\Users\moham\Desktop\final
git init
git add .
git commit -m "Prepare for deployment"
```

## Step 2: Deploy Backend to Render
1. Go to https://render.com and sign up/sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the BACKEND folder
5. Configure settings:
   - Name: survey-backend
   - Build Command: `npm install && npm run build-frontend`
   - Start Command: `npm start`
6. Add Environment Variables:
   - NODE_ENV = production
   - JWT_SECRET = your_secure_secret_key
7. Add PostgreSQL Database from the dashboard
8. Deploy!

## Step 3: Get Your Backend URL
After deployment completes, copy the URL that Render gives you (something like https://survey-backend-xxxx.onrender.com)

## Step 4: Update Frontend API URL
Edit `FRONTEND/src/api/index.js` and change the baseURL to your Render backend URL:
```javascript
baseURL: 'https://your-render-backend-url.onrender.com/api/v1'
```

## Step 5: Deploy Frontend to Vercel
1. Go to https://vercel.com and sign up/sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the FRONTEND folder
5. Configure:
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Deploy!

## Step 6: Test Your Application
Visit your Vercel frontend URL and test if everything works!

## Notes:
- Render's free tier includes 100GB bandwidth/month
- PostgreSQL database is included for free
- Your app won't sleep (unlike Heroku free tier)
- Updates to GitHub will trigger automatic redeployments