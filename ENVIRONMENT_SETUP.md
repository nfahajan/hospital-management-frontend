# Environment Setup Instructions

## Frontend Environment Configuration

To connect the frontend to your backend, you need to create a `.env.local` file in the `hospital-management-frontend` directory.

### Step 1: Create .env.local file

Create a new file called `.env.local` in the `hospital-management-frontend` directory with the following content:

```env
# Frontend Environment Configuration
# Backend API URL - Update this to match your backend server
NEXT_PUBLIC_API_URL=http://localhost:3005/api

# Frontend Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development mode
NODE_ENV=development
```

### Step 2: Update Backend URL (if needed)

If your backend is running on a different port or host, update the `NEXT_PUBLIC_API_URL` accordingly:

- **Local development**: `http://localhost:3001/api` (default)
- **Different port**: `http://localhost:YOUR_PORT/api`
- **Remote server**: `https://your-backend-domain.com/api`

### Step 3: Start Both Servers

1. **Start the backend server** (in `hospital-management-backend` directory):

   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Start the frontend server** (in `hospital-management-frontend` directory):
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Step 4: Verify Connection

1. Backend should be running on: `http://localhost:3001`
2. Frontend should be running on: `http://localhost:3000`
3. Open the frontend URL in your browser
4. The frontend will automatically connect to the backend API

## Environment Variables Explained

- `NEXT_PUBLIC_API_URL`: The base URL for your backend API
- `NEXT_PUBLIC_APP_URL`: The URL where your frontend is hosted
- `NODE_ENV`: Environment mode (development/production)

## Production Deployment

For production deployment, update the environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-production-backend.com/api
NEXT_PUBLIC_APP_URL=https://your-production-frontend.com
NODE_ENV=production
```

## Troubleshooting

### Connection Issues

1. **Backend not running**: Make sure your backend server is started
2. **Wrong port**: Check if your backend is running on port 3001
3. **CORS issues**: Ensure your backend allows requests from `http://localhost:3000`
4. **Environment variables**: Verify `.env.local` file exists and has correct values

### Common Ports

- Backend default: `3001`
- Frontend default: `3000`
- Database: `27017` (MongoDB) or `5432` (PostgreSQL)

## Security Notes

- Never commit `.env.local` to version control
- Use different API URLs for development and production
- Ensure your backend has proper CORS configuration
- Use HTTPS in production environments
