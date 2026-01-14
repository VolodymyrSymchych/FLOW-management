import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../package.json';
import { config } from './config';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Task Service API',
            version,
            description: 'Task management microservice for the Project Scope Analyzer application',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: `http://localhost:${config.service.port}`,
                description: 'Development server',
            },
            {
                url: '/api',
                description: 'Relative path (for gateway/proxy)',
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
                Task: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                        },
                        title: {
                            type: 'string',
                        },
                        description: {
                            type: 'string',
                        },
                        status: {
                            type: 'string',
                            enum: ['todo', 'in_progress', 'done'],
                        },
                        priority: {
                            type: 'string',
                            enum: ['low', 'medium', 'high'],
                        },
                        projectId: {
                            type: 'string',
                        },
                        assigneeId: {
                            type: 'string',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
