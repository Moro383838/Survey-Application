# Free Deployment Guide - Vercel + Railway

## Step 1: Prepare Your Code
Make sure all your changes are committed:
```bash
cd c:\Users\moham\Desktop\final
git init
git add .
git commit -m "Prepare for deployment"
```

## Step 2: Deploy Backend to Railway
1. Go to https://railway.app and sign up/sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub repository
4. Select the BACKEND folder
5. Railway will automatically detect it's a Node.js app
6. Add Environment Variables in Railway dashboard:
   - NODE_ENV = production
   - JWT_SECRET = your_secure_secret_key
7. Add PostgreSQL Database:
   - Go to "Plugins" → "Add Plugin" → "PostgreSQL"
   - Choose the free tier
8. Railway will automatically deploy!

## Step 3: Get Your Backend URL
After deployment completes:
1. Go to your Railway project
2. Click on your service
3. Copy the default domain (something like https://your-service.up.railway.app)

## Step 4: Update Frontend API URL
Edit `FRONTEND/src/api/index.js` and change the baseURL to your Railway backend URL:
```javascript
baseURL: 'https://your-railway-backend-url.up.railway.app/api/v1'
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
- Railway's free tier includes $5 credit monthly
- PostgreSQL database is included for free
- Your app won't sleep (unlike Heroku free tier)
- Updates to GitHub will trigger automatic redeployments