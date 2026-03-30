import { createAppError } from '../core/errors.js';

export function validateLoginPayload(payload) {
  const { email, password } = payload || {};

  if (!email || !password) {
    throw createAppError(400, 'BAD_REQUEST', 'email and password are required');
  }

  return { email, password };
}
