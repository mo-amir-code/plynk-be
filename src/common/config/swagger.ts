import swaggerJsdoc from 'swagger-jsdoc';

const isProduction = process.env.NODE_ENV === 'production';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Plynk API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Plynk Backend',
    },
    servers: [
      {
        url: isProduction ? process.env.BACKEND_URL : `http://localhost:${process.env.PORT || 8080}`,
        description: isProduction ? 'Production server' : 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string', nullable: true },
            fullName: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['ADMIN', 'USER'], default: 'USER' },
            tnc: { type: 'boolean', default: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Page: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            createdBy: { type: 'string', description: 'User ID of the page owner' },
            title: { type: 'string', example: 'My Awesome Creator Page' },
            themeId: { type: 'string', description: 'Selected theme ID' },
            isPublished: { type: 'boolean', default: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Theme: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'USER'] },
            type: { type: 'string', enum: ['SHOP', 'LINKS'] },
            description: { type: 'string' },
            styleConfig: { type: 'object', additionalProperties: true },
            createdBy: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Widget: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            pageId: { type: 'string' },
            type: { 
              type: 'string', 
              enum: ['GITHUB', 'LINKEDIN', 'INSTAGRAM', 'PORTFOLIO', 'FACEBOOK', 'YOUTUBE', 'TWITTER', 'TIKTOK', 'DRIBBBLE', 'CUSTOM'] 
            },
            handle: { type: 'string' },
            fullURL: { type: 'string' },
            startCol: { type: 'integer' },
            startRow: { type: 'integer' },
            colSize: { type: 'integer' },
            rowSize: { type: 'integer' },
            icon: { type: 'string', nullable: true },
            config: { type: 'object', additionalProperties: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Asset: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            url: { type: 'string' },
            ownerType: { type: 'string', enum: ['ADMIN', 'USER'] },
            uploadedBy: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
      responses: {
        Success: {
          description: 'Success (200 OK)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  code: { type: 'integer', example: 200 },
                  message: { type: 'string', example: 'Operation Successful' },
                  result: { type: 'object', nullable: true, example: null },
                },
              },
            },
          },
        },
        AuthSuccess: {
          description: 'Authentication success (200/201)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  code: { type: 'integer', example: 200 },
                  message: { type: 'string', example: 'Success' },
                  result: {
                    type: 'object',
                    properties: {
                      token: { type: 'string', example: 'eyJhbG...' },
                      user: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
        BadRequest: {
          description: 'The request was invalid (400)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  code: { type: 'integer', example: 400 },
                  message: { type: 'string', example: 'Bad Request' },
                  result: { type: 'object', nullable: true, example: null },
                },
              },
            },
          },
        },
        Unauthorized: {
          description: 'Access token is missing or invalid (401)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  code: { type: 'integer', example: 401 },
                  message: { type: 'string', example: 'Unauthorized' },
                  result: { type: 'object', nullable: true, example: null },
                },
              },
            },
          },
        },
        Forbidden: {
          description: 'You do not have permission (403)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  code: { type: 'integer', example: 403 },
                  message: { type: 'string', example: 'Forbidden' },
                  result: { type: 'object', nullable: true, example: null },
                },
              },
            },
          },
        },
        NotFound: {
          description: 'Resource not found (404)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  code: { type: 'integer', example: 404 },
                  message: { type: 'string', example: 'Not Found' },
                  result: { type: 'object', nullable: true, example: null },
                },
              },
            },
          },
        },
        InternalServerError: {
          description: 'Server error (500)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  code: { type: 'integer', example: 500 },
                  message: { type: 'string', example: 'Internal Server Error' },
                  result: { type: 'object', nullable: true, example: null },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/modules/**/*.routes.ts',
    './src/modules/**/*.validation.ts'
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
