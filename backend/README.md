# Biased India - Backend API

## Setup Instructions

1. **Install Dependencies**
```bash
cd backend
go mod download
```

2. **Set up PostgreSQL Database**
```bash
# Create database
createdb indian_biased

# Run schema
psql indian_biased < schema.sql
```

3. **Configure Environment Variables**
```bash
cp .env.example .env
# Edit .env with your actual values
```

4. **Set up Google OAuth**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing one
- Enable Google+ API
- Create OAuth 2.0 credentials
- Add http://localhost:8080/api/auth/google/callback to authorized redirect URIs
- Copy Client ID and Client Secret to .env

5. **Run the Server**
```bash
go run main.go
```

The API will be available at `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Get Google OAuth URL
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (requires auth)
- `GET /api/auth/me` - Get current user (requires auth)

## Database Schema

The database includes:
- `users` - User accounts
- `oauth_accounts` - OAuth provider accounts
- `articles` - News articles
- `facts` - Neutral facts for articles
- `perspectives` - Left/right perspectives for articles
- `sessions` - Refresh token sessions
