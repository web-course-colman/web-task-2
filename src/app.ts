import express from "express";
import connectDB from "./config/database";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import { authenticateToken } from "./middleware/auth";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/post";
import commentsRoutes from "./routes/comments";
import { swaggerSpec } from "./config/swagger";

export const createApp = (): express.Application => {
  const app: express.Application = express();

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
  app.use("/comments", commentsRoutes);

  // Default route
  app.get("/", (req: express.Request, res: express.Response) =>
    res.send("API Running")
  );

  return app;
};
