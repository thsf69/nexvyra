export class ApiError extends Error {
  public statusCode: number;
  public errors?: any[];

  constructor(statusCode: number, message: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const formatResponse = (success: boolean, message: string, data?: any, errors?: any[]) => {
  return {
    success,
    message,
    ...(data !== undefined && { data }),
    ...(errors !== undefined && { errors }),
  };
};
