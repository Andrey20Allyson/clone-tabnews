import { defaultHandlerOptions } from "infra/generic-handlers.js";
import user from "models/user.js";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(postHandler);

export default router.handler(defaultHandlerOptions);

async function postHandler(request, response) {
  const userInputValues = request.body;

  const newUser = await user.create(userInputValues);

  return response.status(201).json(newUser);
}
