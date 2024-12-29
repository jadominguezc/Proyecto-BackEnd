module.exports = {
    openapi: "3.0.0",
    info: {
      title: "API Documentation - Backend Final",
      version: "1.0.0",
      description: "Documentación de las APIs del proyecto Backend Final",
      contact: {
        name: "Backend Final",
        email: "contact@backendfinal.com",
      },
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
  