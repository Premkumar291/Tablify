# Production Deployment Guide for Tablify

This project is now structured as a production-ready monorepo. The backend (Express) is configured to serve the frontend (React) static files.

## Local Testing (Production Build)

To test the production build locally:

1.  **Build the Frontend**:
    ```bash
    cd frontend
    npm install
    npm run build
    ```
2.  **Install Backend Dependencies**:
    ```bash
    cd ../backend
    npm install
    ```
3.  **Ensure Python dependencies are installed**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Start the Server**:
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:5000`.

## Hosting Preparation

### 1. Environment Variables
Ensure you set the following environment variables in your hosting provider (e.g., Render, Vercel, Heroku):

**Backend:**
- `MONGO_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A long random string for auth.
- `JWT_REFRESH_SECRET`: Another random string for refresh tokens.
- `NODE_ENV`: `production`
- `PORT`: Usually provided by the host.

**Frontend:**
- `VITE_API_URL`: Leave empty if the backend serves the frontend (default).

### 2. Deployment Script (e.g., on Render/Railway)
Use the root `package.json` scripts if your provider supports it:

- **Build Command**: `npm run install:all && npm run build`
- **Start Command**: `npm start`

## Route Fixes Applied
- **Auth Redirection**: Fixed the issue where users weren't redirected after login/register.
- **SPA Refreshing**: Added a catch-all route in Express to prevent `404` errors when refreshing pages like `/dashboard`.
- **Relative API**: Configured the frontend to use relative API paths, making it work instantly on any domain.
- **Helmet CSP**: Loosened Security Policies slightly to allow the React app to load scripts and fonts in a production environment.
