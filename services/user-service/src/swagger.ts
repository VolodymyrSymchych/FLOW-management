import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../package.json';
import { config } from './config';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'User Service API',
            version,
            description: 'User management microservice for the Project Scope Analyzer application',
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
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                        },
                        email: {
                            type: 'string',
                        },
                        firstName: {
                            type: 'string',
                        },
                        lastName: {
                            type: 'string',
                        },
                        avatar: {
                            type: 'string',
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
