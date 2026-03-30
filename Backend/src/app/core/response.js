import { AppError } from './errors.js';

export function sendError(res, error) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.error,
      message: error.message,
      statusCode: error.statusCode
    });
  }

  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Unexpected error',
    statusCode: 500
  });
}
