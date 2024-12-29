import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API Users Documentation",
    version: "1.0.0",
    description: "Documentación de APIs que involucren Usuarios: Users, Mocks & Sessions",
  },
  servers: [
    {
      url: "http://localhost:8080",
      description: "Servidor local",
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

const options = {
  swaggerDefinition,
  apis: [
    path.resolve("src/docs/paths.yml"),
    path.resolve("src/docs/requests.yml"),
    path.resolve("src/docs/responses.yml"),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default swaggerDocs;
