import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ReservaSpace API Documentation',
      version: '1.0.0',
      description: 'API documentation for the ReservaSpace application',
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Development server',
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
            id: { type: 'integer', format: 'int32' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'regular', 'manager'] },
            status: { type: 'string', enum: ['active', 'inactive', 'suspend'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['name', 'email', 'password', 'phone', 'role'],
        },
        Space: {
          type: 'object',
          properties: {
            id: { type: 'integer', format: 'int32' },
            name: { type: 'string' },
            description: { type: 'string' },
            capacity: { type: 'integer' },
            location: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['name', 'description', 'capacity', 'location'],
        },
        Resource: {
          type: 'object',
          properties: {
            id: { type: 'integer', format: 'int32' },
            name: { type: 'string' },
            type: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['name', 'type'],
        },
        Reservation: {
          type: 'object',
          properties: {
            id: { type: 'integer', format: 'int32' },
            userId: { type: 'integer', format: 'int32' },
            spaceId: { type: 'integer', format: 'int32' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['pending', 'confimerd', 'completed', 'canceled'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['userId', 'spaceId', 'startTime', 'endTime'],
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // files containing annotations for the OpenAPI specification
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
