function toBeDateISOString(actual) {
  const pass = new Date(actual).toISOString() === actual;
  const formatedExpected = this.utils.printExpected("YYYY-MM-DDThh:mm:ss.sssZ");

  if (!pass) {
    return {
      message: () =>
        `Expected ${this.utils.printReceived(
          actual,
        )} to follows the format ${formatedExpected}`,
      pass: false,
    };
  }

  return {
    message: () =>
      `Expected ${this.utils.printReceived(
        actual,
      )} not to follows the format ${formatedExpected}`,
    pass: true,
  };
}

expect.extend({
  toBeDateISOString,
});
