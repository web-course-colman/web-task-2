const express = require("express");
const connectDB = require("./config/database");
const bodyParser = require("body-parser");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Posts API",
    version: "1.0.0",
    description: "API for managing posts",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.js"], // paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJSDoc(options);

// Middleware to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));
app.use(bodyParser.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Connect Database
connectDB();

// Routes
app.use("/post", require("./routes/post"));

// Default route
app.get("/", (req, res) => res.send("API Running"));

module.exports = app;
