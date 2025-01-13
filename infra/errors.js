export class InternalServerError extends Error {
  constructor({ cause }) {
    super("Um error interno não esperado aconteceu.", {
      cause: cause,
    });

    this.name = "InternalServerError";
    this.action = "Entre em contato com o suporte.";
    this.statusCode = 500;
  }

  toJson() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
