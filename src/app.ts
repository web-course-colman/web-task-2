import express from "express";
import connectDB from "./config/database";
import bodyParser from "body-parser";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { authenticateToken } from "./middleware/auth";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/post";

export const createApp = (): express.Application => {
  const app: express.Application = express();

  // Swagger definition
  const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
      title: "Posts API with Authentication",
      version: "1.0.0",
      description: "API for managing posts with JWT authentication",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  };

  const options: swaggerJSDoc.Options = {
    swaggerDefinition,
    apis: ["./src/routes/*.ts"], // paths to files containing OpenAPI definitions
  };

  const swaggerSpec = swaggerJSDoc(options);

  // Middleware to parse JSON bodies
  app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));
  app.use(bodyParser.json());

  // Swagger UI
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Connect Database
  connectDB();

  // Authentication Routes
  app.use("/auth", authRoutes);

  // Authentication Middleware
  app.use(authenticateToken);

  // All Routes
  app.use("/post", postRoutes);

  // Default route
  app.get("/", (req: express.Request, res: express.Response) =>
    res.send("API Running")
  );

  return app;
};
