/**
 * PATHFINITY MOCK SERVER
 * MSW (Mock Service Worker) setup for API mocking in tests
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server with our request handlers
export const server = setupServer(...handlers);

// Export server for use in tests
export * from 'msw';
export { server };