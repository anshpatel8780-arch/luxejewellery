# 🚀 Render Deployment Guide: LuxeJewels Backend

This guide outlines the steps to successfully deploy the LuxeJewels API to Render.

## 📋 Required Environment Variables

Before deploying, you **MUST** set the following environment variables in the Render Dashboard (Dashboard > Your Service > Environment):

| Key | Value Description |
|-----|-------------------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long, random string for auth security |
| `FRONTEND_URL` | `https://kairojewels.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API Secret |
| `EMAIL_USER` | Gmail address for OTPs/Inquiries |
| `EMAIL_PASS` | Gmail App Password (NOT your regular password) |
| `GEMINI_API_KEY` | Google Gemini API Key for AI Chat |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (Test or Live) |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |

## 🛠️ Render Settings

- **Service Type**: Web Service
- **Runtime**: Node
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`

## 🛡️ Security Features Active
- **CORS**: Automatically allows `http://localhost:4200` for development and your `FRONTEND_URL` for production.
- **Fail-Safe Startup**: The server will crash with a clear error message if `MONGO_URI`, `JWT_SECRET`, or `FRONTEND_URL` are missing, preventing "broken" deployments.
- **DB Safety**: Fallback to in-memory database is disabled in production to ensure data integrity.

## ✅ Health Check
Once deployed, visit your Render URL (e.g., `https://luxejewellery.onrender.com/`). You should see a JSON response:
```json
{
  "status": "online",
  "database": "connected",
  "environment": "production"
}
```
