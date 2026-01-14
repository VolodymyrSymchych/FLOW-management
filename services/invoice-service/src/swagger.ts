import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../package.json';
import { config } from './config';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Invoice Service API',
            version,
            description: 'Invoice and payment management microservice for the Project Scope Analyzer application',
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
                Invoice: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                        },
                        status: {
                            type: 'string',
                            enum: ['draft', 'pending', 'paid', 'cancelled'],
                        },
                        amount: {
                            type: 'number',
                        },
                        currency: {
                            type: 'string',
                        },
                        createdAt: {
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
