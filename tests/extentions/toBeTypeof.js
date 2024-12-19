function toBeTypeof(actual, typeName) {
  const pass = typeof actual === typeName;

  if (!pass) {
    return {
      message: () =>
        `Expected type of ${this.utils.printReceived(
          actual
        )} to be ${this.utils.printExpected(typeName)}`,
      pass: false,
    };
  }

  return {
    message: () =>
      `Expected type of ${this.utils.printReceived(
        actual
      )} not to be ${this.utils.printExpected(typeName)}`,
    pass: true,
  };
}

function toBeInt(actual) {
  const pass = Number.isInteger(actual);
  const formatedExpected = this.utils.printExpected("integer");

  if (!pass) {
    return {
      message: () =>
        `Expected type of ${this.utils.printReceived(
          actual
        )} to be a ${formatedExpected}`,
      pass: false,
    };
  }

  return {
    message: () =>
      `Expected type of ${this.utils.printReceived(
        actual
      )} not to be a ${formatedExpected}`,
    pass: true,
  };
}

expect.extend({
  toBeInt,
  toBeTypeof,
});
