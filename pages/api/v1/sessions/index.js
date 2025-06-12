import { UnauthorizedError } from "infra/errors";
import { defaultHandlerOptions } from "infra/generic-handlers.js";
import password from "models/password";
import user from "models/user.js";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(postHandler);

export default router.handler(defaultHandlerOptions);

async function postHandler(request, response) {
  const userInputValues = request.body;

  try {
    const storedUser = await user
      .findOneByEmail(userInputValues.email)
      .catch(hashAndReject(userInputValues));

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

function hashAndReject(userInputValues) {
  return async (error) => {
    if (
      userInputValues.__testRounds != null &&
      process.env.NODE_ENV !== "production"
    ) {
      await password.hash(
        userInputValues.password,
        userInputValues.__testRounds,
      );

      return Promise.reject(error);
    }

    await password.hash(userInputValues.password);

    return Promise.reject(error);
  };
}
