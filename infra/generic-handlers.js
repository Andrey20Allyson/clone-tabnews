import { InternalServerError, MethodNotAllowedError } from "./errors";

export function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();

  response
    .status(publicErrorObject.statusCode)
    .json(publicErrorObject.toJson());
}

export function onErrorHandler(error, request, response) {
  const publicErrorObject = new InternalServerError({
    statusCode: error.statusCode,
    cause: error,
  });

  console.error(publicErrorObject);
  response
    .status(publicErrorObject.statusCode)
    .json(publicErrorObject.toJson());
}

export const defaultHandlerOptions = {
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
};
