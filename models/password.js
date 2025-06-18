import bcryptjs from "bcryptjs";

async function hash(password, nonProductionExternRounds = null) {
  const rounds = getRoundsForEnv(nonProductionExternRounds);

  return await bcryptjs.hash(password, rounds);
}

function getRoundsForEnv(nonProductionExternRounds) {
  if (process.env.NODE_ENV === "production") {
    return 14;
  }

  return nonProductionExternRounds ?? 1;
}

async function compare(passwordInText, hash) {
  return await bcryptjs.compare(passwordInText, hash);
}

const password = {
  hash,
  compare,
  getRoundsForEnv,
};

export default password;
