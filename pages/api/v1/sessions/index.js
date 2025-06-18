import { UnauthorizedError } from "infra/errors";
import { defaultHandlerOptions } from "infra/generic-handlers.js";
import password from "models/password";
import user from "models/user.js";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(delayMaskMiddleware, postHandler);

export default router.handler(defaultHandlerOptions);

async function postHandler(request, response) {
  const userInputValues = request.body;

  try {
    const storedUser = await user.findOneByEmail(userInputValues.email);

    const isPasswordMatched = await password.compare(
      userInputValues.password,
      storedUser.password,
    );
    if (!isPasswordMatched) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se este dado está correto.",
      });
    }
  } catch (error) {
    throw new UnauthorizedError({
      message: "Dados de autorização não conferem.",
      action: "Verifique se os dados enviados estão corretos.",
    });
  }

  return response.status(201).json({});
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

  console.log({ fakeHashDelay, randomDelay, millisSinceRequestStart });

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
