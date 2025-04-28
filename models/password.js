import bcryptjs from "bcryptjs";

async function hash(password) {
  const rounds = getRoundsForEnv();

  return await bcryptjs.hash(password, rounds);
}

function getRoundsForEnv() {
  if (process.env.NODE_ENV === "production") {
    return 14;
  }

  return 1;
}

async function compare(passwordInText, hash) {
  return await bcryptjs.compare(passwordInText, hash);
}

const password = {
  hash,
  compare,
};

export default password;
