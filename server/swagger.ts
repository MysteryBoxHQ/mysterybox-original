import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RollingDrop External API',
      version: '1.0.0',
      description: 'External API for integrating RollingDrop mystery boxes into 3rd party websites',
      contact: {
        name: 'RollingDrop API Support',
        email: 'api@rollingdrop.com'
      }
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Production API'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key required for all endpoints'
        },
        ApiKeyQuery: {
          type: 'apiKey',
          in: 'query',
          name: 'api_key',
          description: 'API key as query parameter (alternative to header)'
        }
      },
      schemas: {
        Box: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 50 },
            name: { type: 'string', example: 'Samsung Galaxy Mystery Box' },
            description: { type: 'string', example: 'Premium Samsung Galaxy devices and accessories' },
            price: { type: 'number', format: 'float', example: 29.99 },
            currency: { type: 'string', example: 'USD' },
            rarity: { type: 'string', example: 'legendary' },
            imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
            featured: { type: 'boolean', example: true }
          }
        },
        Item: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 123 },
            name: { type: 'string', example: 'Samsung Galaxy S24 Ultra' },
            description: { type: 'string', example: 'Latest flagship Samsung smartphone' },
            rarity: { type: 'string', enum: ['common', 'rare', 'epic', 'legendary', 'mythical'] },
            icon: { type: 'string', example: 'https://example.com/icon.jpg' },
            dropChance: { type: 'number', example: 15.5 },
            value: { type: 'number', format: 'float', example: 899.99 }
          }
        },
        BoxWithItems: {
          allOf: [
            { $ref: '#/components/schemas/Box' },
            {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Item' }
                }
              }
            }
          ]
        },
        OpenBoxRequest: {
          type: 'object',
          required: ['boxId', 'userId', 'userBalance'],
          properties: {
            boxId: { type: 'integer', example: 50 },
            userId: { type: 'string', example: 'user123' },
            userBalance: { type: 'number', format: 'float', minimum: 0, example: 100.00 }
          }
        },
        OpenBoxResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                item: { $ref: '#/components/schemas/Item' },
                box: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    price: { type: 'number' }
                  }
                },
                transaction: {
                  type: 'object',
                  properties: {
                    cost: { type: 'number' },
                    newBalance: { type: 'number' },
                    profit: { type: 'number' }
                  }
                }
              }
            },
            meta: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
                userId: { type: 'string' }
              }
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                timestamp: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'API key required' },
            details: { type: 'object' }
          }
        }
      }
    },
    security: [
      { ApiKeyAuth: [] },
      { ApiKeyQuery: [] }
    ]
  },
  apis: ['./server/external-api.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Add manual path definitions since JSDoc annotations are complex
swaggerSpec.paths = {
  '/boxes': {
    get: {
      summary: 'Get all mystery boxes',
      description: 'Retrieve a list of all available mystery boxes for integration',
      tags: ['Boxes'],
      security: [{ ApiKeyAuth: [] }, { ApiKeyQuery: [] }],
      responses: {
        200: {
          description: 'List of all boxes',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ApiResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Box' }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - API key required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  '/boxes/featured': {
    get: {
      summary: 'Get featured boxes',
      description: 'Retrieve only featured mystery boxes for homepage displays',
      tags: ['Boxes'],
      security: [{ ApiKeyAuth: [] }, { ApiKeyQuery: [] }],
      responses: {
        200: {
          description: 'List of featured boxes',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ApiResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Box' }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/ServerError' }
      }
    }
  },
  '/boxes/{boxId}': {
    get: {
      summary: 'Get specific box with items',
      description: 'Retrieve detailed information about a specific box including all items',
      tags: ['Boxes'],
      security: [{ ApiKeyAuth: [] }, { ApiKeyQuery: [] }],
      parameters: [
        {
          name: 'boxId',
          in: 'path',
          required: true,
          description: 'Unique identifier of the box',
          schema: { type: 'integer', example: 50 }
        }
      ],
      responses: {
        200: {
          description: 'Box details with items',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ApiResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/BoxWithItems' }
                    }
                  }
                ]
              }
            }
          }
        },
        400: {
          description: 'Invalid box ID',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        404: {
          description: 'Box not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  '/boxes/{boxId}/items': {
    get: {
      summary: 'Get box items only',
      description: 'Retrieve only the items that can be won from a specific box',
      tags: ['Boxes'],
      security: [{ ApiKeyAuth: [] }, { ApiKeyQuery: [] }],
      parameters: [
        {
          name: 'boxId',
          in: 'path',
          required: true,
          description: 'Unique identifier of the box',
          schema: { type: 'integer', example: 50 }
        }
      ],
      responses: {
        200: {
          description: 'List of items in the box',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ApiResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Item' }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  '/open-box': {
    post: {
      summary: 'Open a mystery box',
      description: 'Open a mystery box for a user and return the won item',
      tags: ['Box Opening'],
      security: [{ ApiKeyAuth: [] }, { ApiKeyQuery: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/OpenBoxRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Box opened successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OpenBoxResponse' }
            }
          }
        },
        400: {
          description: 'Invalid request or insufficient balance',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        404: {
          description: 'Box not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  '/stats': {
    get: {
      summary: 'Get API statistics',
      description: 'Retrieve general statistics about the API and available boxes',
      tags: ['Statistics'],
      security: [{ ApiKeyAuth: [] }, { ApiKeyQuery: [] }],
      responses: {
        200: {
          description: 'API statistics',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      totalBoxes: { type: 'integer', example: 7 },
                      featuredBoxes: { type: 'integer', example: 5 },
                      recentOpenings: { type: 'integer', example: 42 },
                      priceRange: {
                        type: 'object',
                        properties: {
                          min: { type: 'number', example: 5.99 },
                          max: { type: 'number', example: 99.99 }
                        }
                      }
                    }
                  },
                  meta: {
                    type: 'object',
                    properties: {
                      timestamp: { type: 'string', format: 'date-time' },
                      version: { type: 'string', example: '1.0.0' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export function setupSwagger(app: Express) {
  // Swagger UI setup
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0 }
      .swagger-ui .info .title { color: #3b82f6 }
    `,
    customSiteTitle: 'RollingDrop API Documentation',
    customfavIcon: '/favicon.ico'
  }));

  // JSON spec endpoint
  app.get('/api/docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('Swagger documentation available at: /api/docs');
  console.log('Swagger JSON spec available at: /api/docs/swagger.json');
}