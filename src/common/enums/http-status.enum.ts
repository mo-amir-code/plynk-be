export enum HttpStatus {
  // 2xx Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // 4xx Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

export const HttpMessage: Record<HttpStatus, string> = {
  [HttpStatus.OK]: "Success",
  [HttpStatus.CREATED]: "Resource created successfully",
  [HttpStatus.ACCEPTED]: "Request accepted",
  [HttpStatus.NO_CONTENT]: "No content",

  [HttpStatus.BAD_REQUEST]: "Bad request",
  [HttpStatus.UNAUTHORIZED]: "Unauthorized access",
  [HttpStatus.FORBIDDEN]: "Forbidden access",
  [HttpStatus.NOT_FOUND]: "Resource not found",
  [HttpStatus.METHOD_NOT_ALLOWED]: "Method not allowed",
  [HttpStatus.CONFLICT]: "Conflict occurred",
  [HttpStatus.UNPROCESSABLE_ENTITY]: "Validation error",
  [HttpStatus.TOO_MANY_REQUESTS]: "Too many requests",

  [HttpStatus.INTERNAL_SERVER_ERROR]: "Internal server error",
  [HttpStatus.NOT_IMPLEMENTED]: "Not implemented",
  [HttpStatus.BAD_GATEWAY]: "Bad gateway",
  [HttpStatus.SERVICE_UNAVAILABLE]: "Service unavailable",
};
