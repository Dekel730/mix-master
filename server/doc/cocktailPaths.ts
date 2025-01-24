import { errorHandler } from "./components";

const cocktailPaths = {
    '/api/cocktails': {
      get: {
        tags: ['Cocktails'],
        summary: 'Get all cocktails',
        description: 'Retrieve all cocktails from the database',
        security: [{ jwtAuth: [] }],
        responses: {
          200: {
            description: 'Cocktails retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    cocktails: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', example: '11007' },
                          title: { type: 'string', example: 'Margarita' },
                          image: { type: 'string', example: 'https://example.com/margarita.jpg' },
                          instructions: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['Shake all ingredients.', 'Pour into a glass.'],
                          },
                          ingredients: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', example: 'Tequila' },
                                amount: { type: 'string', example: '1 1/2 oz' },
                              },
                            },
                          },
                          description: { type: 'string', example: 'Cocktail' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          ...errorHandler(500, 'Some server error', 'Server error'),
        },
      },
    },
    '/api/cocktails/random': {
      get: {
        tags: ['Cocktails'],
        summary: 'Get random cocktails',
        description: 'Retrieve a random selection of cocktails',
        security: [{ jwtAuth: [] }],
        responses: {
          200: {
            description: 'Random cocktails retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    cocktails: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', example: '11007' },
                          title: { type: 'string', example: 'Margarita' },
                          image: { type: 'string', example: 'https://example.com/margarita.jpg' },
                          instructions: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['Shake all ingredients.', 'Pour into a glass.'],
                          },
                          ingredients: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', example: 'Tequila' },
                                amount: { type: 'string', example: '1 1/2 oz' },
                              },
                            },
                          },
                          description: { type: 'string', example: 'Cocktail' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          ...errorHandler(500, 'Some server error', 'Server error'),
        },
      },
    },
    '/api/cocktails/ingredients': {
      get: {
        tags: ['Cocktails'],
        summary: 'Search cocktail ingredients',
        description: 'Retrieve a list of ingredients matching the query',
        security: [{ jwtAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'name',
            required: true,
            schema: { type: 'string' },
            description: 'Partial or full name of the ingredient',
          },
        ],
        responses: {
          200: {
            description: 'Ingredients retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    ingredients: {
                      type: 'array',
                      items: { type: 'string', example: 'Tequila' },
                    },
                  },
                },
              },
            },
          },
          ...errorHandler(500, 'Some server error', 'Server error'),
        },
      },
    },
    '/api/cocktails/search': {
      get: {
        tags: ['Cocktails'],
        summary: 'Search cocktails by name',
        description: 'Retrieve cocktails matching the given name',
        security: [{ jwtAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'name',
            required: true,
            schema: { type: 'string' },
            description: 'Name of the cocktail to search for',
          },
        ],
        responses: {
          200: {
            description: 'Cocktails retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    cocktails: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', example: '11007' },
                          title: { type: 'string', example: 'Margarita' },
                          image: { type: 'string', example: 'https://example.com/margarita.jpg' },
                          instructions: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['Shake all ingredients.', 'Pour into a glass.'],
                          },
                          ingredients: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', example: 'Tequila' },
                                amount: { type: 'string', example: '1 1/2 oz' },
                              },
                            },
                          },
                          description: { type: 'string', example: 'Cocktail' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          ...errorHandler(500, 'Some server error', 'Server error'),
        },
      },
    },
    '/api/cocktails/{id}': {
      get: {
        tags: ['Cocktails'],
        summary: 'Get cocktail by ID',
        description: 'Retrieve a specific cocktail by its ID',
        security: [{ jwtAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the cocktail',
          },
        ],
        responses: {
          200: {
            description: 'Cocktail retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    cocktail: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string', example: '11007' },
                        title: { type: 'string', example: 'Margarita' },
                        image: { type: 'string', example: 'https://example.com/margarita.jpg' },
                        instructions: {
                          type: 'array',
                          items: { type: 'string' },
                          example: ['Shake all ingredients.', 'Pour into a glass.'],
                        },
                        ingredients: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string', example: 'Tequila' },
                              amount: { type: 'string', example: '1 1/2 oz' },
                            },
                          },
                        },
                        description: { type: 'string', example: 'Cocktail' },
                      },
                    },
                  },
                },
              },
            },
          },
          ...errorHandler(404, 'Cocktail not found', 'The cocktail does not exist'),
          ...errorHandler(500, 'Some server error', 'Server error'),
        },
      },
    },
  };
  
  export default cocktailPaths;
  