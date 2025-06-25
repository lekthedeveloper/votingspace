import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import type { Application } from "express"
import { adminAuth } from "../middleware/admin.middleware"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Voting App API",
      version: "1.0.0",
      description: "A collaborative decision-making voting application API - Admin Access Required",
      contact: {
        name: "API Support",
        email: "support@votingapp.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5005",
        description: "Development server",
      },
      {
        url: "https://your-production-url.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "jwt",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "User ID",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            name: {
              type: "string",
              description: "User full name",
            },
            role: {
              type: "string",
              enum: ["USER", "ADMIN", "MODERATOR"],
              description: "User role",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation date",
            },
          },
        },
        Room: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Room ID",
            },
            title: {
              type: "string",
              description: "Room title",
            },
            description: {
              type: "string",
              description: "Room description",
            },
            isActive: {
              type: "boolean",
              description: "Whether the room is active for voting",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Room creation date",
            },
            options: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Option",
              },
            },
          },
        },
        Option: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Option ID",
            },
            text: {
              type: "string",
              description: "Option text",
            },
            roomId: {
              type: "string",
              description: "Associated room ID",
            },
          },
        },
        Vote: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Vote ID",
            },
            roomId: {
              type: "string",
              description: "Room ID",
            },
            optionId: {
              type: "string",
              description: "Selected option ID",
            },
            userId: {
              type: "string",
              description: "User ID (null for guest votes)",
            },
            guestId: {
              type: "string",
              description: "Guest ID (null for user votes)",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Vote timestamp",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },
            message: {
              type: "string",
              description: "Error message",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            message: {
              type: "string",
              description: "Success message",
            },
            data: {
              type: "object",
              description: "Response data",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/v1/*.ts"], // Path to the API files
}

const specs = swaggerJsdoc(options)

export const setupSwagger = (app: Application): void => {
  // Handle POST requests for login to /api-docs
  app.post("/api-docs", adminAuth, (req, res) => {
    res.redirect("/api-docs")
  })

  // Protected Swagger UI setup - requires admin authentication
  app.use(
    "/api-docs",
    adminAuth,
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .info .title { color: #3b82f6; font-size: 2rem; }
      .swagger-ui .info .description { 
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
        padding: 1.5rem; 
        border-radius: 10px; 
        border-left: 4px solid #3b82f6;
        margin: 1rem 0;
        font-weight: 500;
      }
      .swagger-ui .info .description::before {
        content: "🔒 ";
        font-size: 1.2rem;
      }
      .swagger-ui .scheme-container {
        background: #fef3c7;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid #f59e0b;
        margin: 1rem 0;
      }
    `,
      customSiteTitle: "🗳️ Voting App API - Admin Portal",
      customfavIcon:
        "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🗳️</text></svg>",
    }),
  )

  // Protected JSON endpoint for the swagger spec
  app.get("/api-docs.json", adminAuth, (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.send(specs)
  })
}
