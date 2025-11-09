# Project Structure

## Complete File Tree

```
backend-template/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection setup
│   │   ├── env.js                # Environment variables validation
│   │   └── constants.js          # App-wide constants (roles, status codes)
│   │
│   ├── users/
│   │   ├── users.model.js        # User schema & model
│   │   ├── users.service.js      # User business logic
│   │   └── users.routes.js       # User API endpoints
│   │
│   ├── auth/
│   │   ├── auth.service.js       # Auth business logic
│   │   └── auth.routes.js        # Auth API endpoints
│   │
│   ├── posts/
│   │   ├── posts.model.js        # Post schema & model (example)
│   │   ├── posts.service.js      # Post business logic
│   │   └── posts.routes.js       # Post API endpoints
│   │
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   ├── roleCheck.js          # Role-based access control
│   │   ├── errorHandler.js       # Global error handling
│   │   └── validation.js         # Request validation
│   │
│   ├── utils/
│   │   ├── jwt.js                # JWT utilities
│   │   ├── password.js           # Password utilities
│   │   └── response.js           # Standardized responses
│   │
│   └── app.js                    # Express app configuration
│
├── guides/                       # (To be added by you)
│   ├── 01-setup.md
│   ├── 02-authentication.md
│   ├── 03-creating-components.md
│   ├── 04-api-patterns.md
│   └── 05-deployment.md
│
├── server.js                     # Entry point
├── package.json                  # Dependencies & scripts
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
└── README.md                     # Documentation
```

## Component Pattern

Each feature follows this structure:

```
component-name/
├── component-name.model.js       # Mongoose schema
├── component-name.service.js     # Business logic
└── component-name.routes.js      # Express routes
```

**Flow:** `Route → Service → Model`

## Key Files Explained

### Entry Points
- **server.js** - Starts the server, connects to DB
- **src/app.js** - Configures Express middleware and routes

### Configuration
- **config/database.js** - MongoDB connection with error handling
- **config/env.js** - Validates required environment variables
- **config/constants.js** - Centralized constants (roles, status codes, etc.)

### Components
- **users/** - User management (CRUD, search, role updates)
- **auth/** - Authentication (register, login, token refresh, password change)
- **posts/** - Example component showing the pattern

### Middleware
- **auth.js** - JWT token verification
- **roleCheck.js** - Role-based access control
- **errorHandler.js** - Catches and formats errors
- **validation.js** - Request validation

### Utilities
- **jwt.js** - Generate and verify tokens
- **password.js** - Hash and compare passwords
- **response.js** - Standardized API responses

## Technologies Used

- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
- **Morgan** - Request logging

## Next Steps

1. Install dependencies: `npm install`
2. Setup `.env` file
3. Add your guides in the `guides/` folder
4. Start building new components by copying the `posts/` pattern