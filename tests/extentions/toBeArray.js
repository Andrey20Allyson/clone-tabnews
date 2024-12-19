function toBeArray(actual) {
  const pass = Array.isArray(actual);
  const formatedExpected = this.utils.printExpected("ArrayLike");

  if (!pass) {
    return {
      message: () =>
        `Expected ${this.utils.printReceived(
          actual
        )} to be a ${formatedExpected}`,
      pass: false,
    };
  }

  return {
    message: () =>
      `Expected ${this.utils.printReceived(
        actual
      )} not to be a ${formatedExpected}`,
    pass: true,
  };
}

expect.extend({
  toBeArray,
});
