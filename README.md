# Posts API with Authentication

A Node.js/TypeScript API for managing posts with JWT-based authentication using Express, MongoDB, and Swagger documentation.

## Features

- User registration and login
- JWT authentication with access and refresh tokens
- CRUD operations for posts, comments and users
- Swagger API documentation
- MongoDB integration
- TypeScript support

## Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Set up environment variables (create a `.env` file):

   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT access tokens
   - `JWT_REFRESH_SECRET`: Secret key for JWT refresh tokens

5. Start the development server:

```bash
npm run dev
```

## Usage

The API will be running on `http://localhost:3000`.

### API Documentation

Access the Swagger UI documentation at: `http://localhost:3000/api-docs`

### Authentication

All post-related endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Available Scripts

- `npm run dev`: Start development server with nodemon
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Start production server
- `npm test`: Run tests with Jest

## Technologies Used

- Node.js
- TypeScript
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Swagger for API documentation
- Jest for testing
- bcryptjs for password hashing
