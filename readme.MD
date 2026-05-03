# Biased India - Digital News Platform

A balanced news platform that presents neutral facts alongside left and right perspectives to help users make informed decisions.

## Features

- **Neutral Facts**: Verifiable, source-backed facts presented without editorial bias
- **Multiple Perspectives**: Compare left and right viewpoints side-by-side
- **User Authentication**: Email/password signup and login
- **SSO Login**: Google OAuth integration for seamless authentication
- **Responsive Design**: Mobile-friendly with tab-based views, desktop side-by-side perspectives

## Tech Stack

### Backend
- Go (Gin framework)
- PostgreSQL
- JWT authentication
- Google OAuth2

### Frontend
- React 19 with TypeScript
- Tailwind CSS
- shadcn/ui components
- React Router
- Axios

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Google OAuth credentials (for SSO login)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/24tylerdurden/indian-biased.git
cd indian-biased
```

2. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Google OAuth credentials:
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

3. **Start the application**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 8080
- Frontend on port 3000

The database schema will be automatically applied on startup.

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- API Health: http://localhost:8080/api/auth/me

## Manual Setup

### Backend Setup

1. **Install Go dependencies**
```bash
cd backend
go mod download
```

2. **Set up PostgreSQL**
```bash
createdb indian_biased
psql indian_biased < schema.sql
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database URL and OAuth credentials
```

4. **Run the backend**
```bash
go run main.go
```

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
```

3. **Run the frontend**
```bash
npm run dev
```

## Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID credentials
5. Add the following authorized redirect URIs:
   - `http://localhost:8080/api/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

## Database Schema

The database includes the following tables:
- `users` - User accounts with email/password and OAuth support
- `oauth_accounts` - OAuth provider accounts (Google, etc.)
- `articles` - News articles
- `facts` - Neutral facts for articles
- `perspectives` - Left/right perspectives for articles
- `sessions` - Refresh token sessions

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Get Google OAuth URL
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (requires auth)
- `GET /api/auth/me` - Get current user (requires auth)

## Project Structure

```
indian-biased/
├── backend/
│   ├── auth/          # JWT and password utilities
│   ├── database/      # Database connection
│   ├── handlers/      # API handlers
│   ├── middleware/    # Auth and CORS middleware
│   ├── models/        # Data models
│   ├── schema.sql     # Database schema
│   └── main.go        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── contexts/    # React contexts
│   │   ├── lib/         # Utilities and API
│   │   └── pages/       # Page components
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Development

### Running tests
```bash
# Backend
cd backend
go test ./...

# Frontend
cd frontend
npm test
```

### Building for production
```bash
# Backend
cd backend
go build -o main .

# Frontend
cd frontend
npm run build
```

## License

MIT
