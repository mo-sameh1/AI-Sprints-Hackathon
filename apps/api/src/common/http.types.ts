export type HealthResponse = {
  status: 'ok';
  service: string;
};

export type ApiErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'DEPENDENCY_UNAVAILABLE'
  | 'UNEXPECTED_ERROR';

export type ApiErrorResponse = {
  error: string;
  code: ApiErrorCode;
  message: string;
  statusCode: number;
  timestamp: string;
  details?: Record<string, unknown>;
};

export const apiError = (
  code: ApiErrorCode,
  message: string,
  statusCode: number,
  details?: Record<string, unknown>
): ApiErrorResponse => ({
  error: message,
  code,
  message,
  statusCode,
  timestamp: new Date().toISOString(),
  ...(details ? { details } : {}),
});

export const notFoundError = (resource: string, id: string): ApiErrorResponse =>
  apiError('NOT_FOUND', `${resource} ${id} not found`, 404, { resource, id });

export const validationError = (
  message: string,
  details?: Record<string, unknown>
): ApiErrorResponse => apiError('VALIDATION_ERROR', message, 400, details);

