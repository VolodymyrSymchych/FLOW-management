import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../package.json';
import { config } from './config';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Auth Service API',
            version,
            description: 'Authentication microservice for the Project Scope Analyzer application',
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
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                        },
                        message: {
                            type: 'string',
                        },
                        service: {
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
