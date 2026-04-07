# School Management System

A full-stack School Management System MVP with role-based access for Admin, Teacher, and Student users.

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js (Express)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT
- **Docs**: Swagger/OpenAPI

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (running locally or via Docker)

## Quick Start (Local Development)

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Set up PostgreSQL

Make sure PostgreSQL is running. Default connection:
```
postgresql://postgres:postgres@localhost:5432/school_management
```

Create the database:
```sql
CREATE DATABASE school_management;
```

### 3. Run database migrations

```bash
npm run db:migrate
```

### 4. Seed the database

```bash
npm run seed
```

### 5. Start both frontend and backend

```bash
npm run dev
```

This starts:
- Backend API at `http://localhost:3001`
- Frontend at `http://localhost:5173`
- API Docs at `http://localhost:3001/api-docs`

## Demo Credentials

All passwords: `password123`

| Role    | Email                  |
|---------|------------------------|
| Admin   | admin@school.com       |
| Teacher | teacher1@school.com    |
| Student | student1@school.com    |

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Description              | Default                                                              |
|----------------|--------------------------|----------------------------------------------------------------------|
| DATABASE_URL   | PostgreSQL connection    | postgresql://postgres:postgres@localhost:5432/school_management       |
| JWT_SECRET     | JWT signing secret       | (set a strong secret in production)                                  |
| JWT_EXPIRES_IN | Token expiration         | 24h                                                                  |
| PORT           | Server port              | 3001                                                                 |
| CORS_ORIGIN    | Allowed frontend origin  | http://localhost:5173                                                |

### Frontend (`frontend/.env`)

| Variable      | Description    | Default                      |
|---------------|----------------|------------------------------|
| VITE_API_URL  | Backend API URL| http://localhost:3001/api    |

## API Documentation

Swagger UI is available at `http://localhost:3001/api-docs` when the backend is running.

### API Endpoints

| Method | Endpoint                              | Auth     | Description                    |
|--------|---------------------------------------|----------|--------------------------------|
| POST   | /api/auth/login                       | Public   | Login                          |
| GET    | /api/auth/profile                     | All      | Get current user profile       |
| GET    | /api/users                            | Admin    | List users (paginated)         |
| POST   | /api/users                            | Admin    | Create user                    |
| GET    | /api/users/:id                        | Admin    | Get user by ID                 |
| PUT    | /api/users/:id                        | Admin    | Update user                    |
| DELETE | /api/users/:id                        | Admin    | Delete user                    |
| GET    | /api/classes                          | All      | List classes                   |
| POST   | /api/classes                          | Admin    | Create class                   |
| GET    | /api/classes/:id                      | All      | Get class with students        |
| PUT    | /api/classes/:id                      | Admin    | Update class                   |
| DELETE | /api/classes/:id                      | Admin    | Delete class                   |
| POST   | /api/classes/:id/enroll               | Admin    | Enroll student                 |
| DELETE | /api/classes/:id/unenroll/:studentId  | Admin    | Unenroll student               |
| GET    | /api/subjects                         | All      | List subjects                  |
| POST   | /api/subjects                         | Admin    | Create subject                 |
| PUT    | /api/subjects/:id                     | Admin    | Update subject                 |
| DELETE | /api/subjects/:id                     | Admin    | Delete subject                 |
| POST   | /api/attendance                       | Admin/Teacher | Mark attendance           |
| GET    | /api/attendance/class/:classId        | All      | Get class attendance           |
| GET    | /api/attendance/student/:studentId    | All      | Get student attendance         |
| GET    | /api/attendance/summary/:classId      | All      | Get attendance summary         |
| GET    | /api/dashboard                        | All      | Get role-based dashboard stats |

## Docker Deployment

```bash
# Build and run all services
docker compose up --build

# Seed the database (in another terminal)
docker compose exec backend node prisma/seed.js
```

## Azure Deployment

### Backend (Azure App Service)

1. Create an Azure App Service (Node.js 22 LTS)
2. Create an Azure Database for PostgreSQL
3. Set environment variables in App Service Configuration
4. Deploy via GitHub Actions or Azure CLI:
   ```bash
   az webapp up --name your-app-name --resource-group your-rg --plan your-plan --runtime "NODE:22-lts" --src-path ./backend
   ```

### Frontend (Azure Static Web Apps)

1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `dist` folder to Azure Static Web Apps
3. Configure routing rules for SPA (all routes -> index.html)

### Database (Azure PostgreSQL)

```bash
az postgres flexible-server create --name your-db-name --resource-group your-rg --admin-user postgres --admin-password <password> --sku-name Standard_B1ms
```

## Project Structure

```
school-management-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.js              # Seed script (50 users)
│   ├── src/
│   │   ├── config/              # DB, logger, swagger config
│   │   ├── controllers/         # Route handlers
│   │   ├── middleware/           # Auth, validation, errors
│   │   ├── routes/              # Express routes
│   │   ├── services/            # Business logic
│   │   └── server.js            # Express app entry point
│   ├── tests/                   # Jest tests
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios config & API endpoints
│   │   ├── components/          # Shared UI components
│   │   ├── context/             # Auth context
│   │   ├── pages/               # Page components
│   │   ├── App.jsx              # Router setup
│   │   └── main.jsx             # Entry point
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── package.json                 # Root scripts
└── README.md
```

## Running Tests

```bash
npm test
```

## License

ISC
