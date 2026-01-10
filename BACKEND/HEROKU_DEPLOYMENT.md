# Heroku Deployment Guide

## Prerequisites
- Heroku CLI installed
- Heroku account created
- Git initialized in your project

## Deployment Steps

### 1. Prepare your project
- Make sure all changes are committed to git
- Ensure your project builds successfully locally

### 2. Create a Heroku app
```bash
heroku create your-app-name
```

### 3. Set environment variables
```bash
heroku config:set NODE_ENV=production
heroku config:set DB_NAME=your_db_name
heroku config:set DB_USER=your_db_user
heroku config:set DB_PASSWORD=your_db_password
heroku config:set DB_HOST=your_db_host
heroku config:set DB_PORT=5432
heroku config:set JWT_SECRET=your_jwt_secret
```

### 4. Deploy to Heroku
```bash
git push heroku main
```

## Environment Variables Required

The following environment variables need to be set in your Heroku app:

- `NODE_ENV`: Set to 'production'
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_HOST`: Database host
- `DB_PORT`: Database port (typically 5432 for PostgreSQL)
- `JWT_SECRET`: Secret key for JWT tokens

## Notes

- The frontend will be built automatically during deployment
- The backend serves the built frontend in production mode
- API requests from the frontend will be relative in production (using `/api/v1`)
- Make sure your PostgreSQL addon is provisioned in Heroku