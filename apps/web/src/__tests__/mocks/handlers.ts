/**
 * MSW Handlers - Main export
 * Combines all API mocks for testing
 */

import { commerceHandlers } from './handlers/commerce';
import { walletHandlers } from './handlers/wallet';
import { fanCrmHandlers } from './handlers/fan-crm';
import { ticketsHandlers } from './handlers/tickets';
import { adminHandlers } from './admin';

export const handlers = [
  ...commerceHandlers,
  ...walletHandlers,
  ...fanCrmHandlers,
  ...ticketsHandlers,
  ...adminHandlers,
];
