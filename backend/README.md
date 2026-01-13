# Tablify Backend

This is the Node.js + Express backend for Tablify.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **PDF Processing**: Python (via child_process)
- **Auth**: JWT (Access + Refresh) + API Keys

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/tablify
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   ```

3. **Run Server**:
   ```bash
   npm run dev
   ```

## Development

- The server runs on `http://localhost:5000`.
- Python scripts are in `src/python/`.

## API Endpoints

### Auth
- `POST /api/auth/register` - { email, password }
- `POST /api/auth/login` - { email, password }
- `POST /api/auth/refresh-token` - { token }
- `POST /api/auth/api-keys` - Generate API Key (Protected)
- `GET /api/auth/api-keys` - List API Keys (Protected)

### Conversion
- `POST /api/convert`
  - Headers: `Authorization: Bearer <token>` or `Authorization: ApiKey <key>`
  - Body: `form-data`
    - `file`: PDF file
    - `format`: json | csv | text | excel

### Admin
- `GET /api/admin/users`
- `GET /api/admin/stats`

## License
MIT
