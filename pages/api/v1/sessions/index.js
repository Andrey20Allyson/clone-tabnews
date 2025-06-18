import { defaultHandlerOptions } from "infra/generic-handlers.js";
import authentication from "models/authentication.js";
import password from "models/password";
import session from "models/session";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(delayMaskMiddleware, postHandler);

export default router.handler(defaultHandlerOptions);

async function postHandler(request, response) {
  const userInputValues = request.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  const createdSession = await session.create(authenticatedUser.id);

  return response.status(201).json(createdSession);
}

async function delayMaskMiddleware(request, response, next) {
  const requestStartTime = Date.now();

  try {
    const result = await next();

    await hashDelayMask(requestStartTime, request.body.__enforceProd);

    return result;
  } catch (error) {
    await hashDelayMask(requestStartTime, request.body.__enforceProd);

    return Promise.reject(error);
  }
}

async function hashDelayMask(requestStartTime, __enforceProd = false) {
  if (process.env.NODE_ENV !== "production" && __enforceProd === false) {
    console.log("> Skiped delay mask");
    return;
  }

  const rounds = password.getRoundsForEnv(__enforceProd ? 12 : null);
  const fakeHashDelay = calcFakeHashDelayMillis(rounds);
  const randomDelay = randomIntInRange(100, 300);
  const millisSinceRequestStart = Date.now() - requestStartTime;

  const delay = fakeHashDelay + randomDelay - millisSinceRequestStart;

  return new Promise((res) => setTimeout(res, delay));

  function calcFakeHashDelayMillis(rounds) {
    // mesma coisa que 0.293 * pow(2, rounds)
    return Math.floor(0.293 * (1 << rounds));
  }

  function randomIntInRange(start, end) {
    return Math.floor(Math.random() * (end - start)) + start;
  }
}
