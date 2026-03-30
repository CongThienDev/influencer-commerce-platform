export class AppError extends Error {
  constructor({ statusCode, error, message }) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.error = error;
  }
}

export function createAppError(statusCode, error, message) {
  return new AppError({ statusCode, error, message });
}
