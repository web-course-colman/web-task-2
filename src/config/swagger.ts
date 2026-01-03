import swaggerJSDoc from "swagger-jsdoc";

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
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts"], // paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJSDoc(options);
