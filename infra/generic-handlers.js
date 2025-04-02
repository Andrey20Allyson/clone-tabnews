import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  ValidationError,
} from "./errors";

export function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();

  response
    .status(publicErrorObject.statusCode)
    .json(publicErrorObject.toJSON());
}

export function onErrorHandler(error, request, response) {
  if (error instanceof ValidationError || error instanceof NotFoundError) {
    return response.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({
    statusCode: error.statusCode,
    cause: error,
  });

  console.error(publicErrorObject);
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

export const defaultHandlerOptions = {
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
};
