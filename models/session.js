import crypto from "node:crypto";
import database from "infra/database";

// 30 days
const EXPIRATION_IN_MILLIS = 30 * 24 * 60 * 60 * 1000;

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLIS);

  const createdSession = await runInsertQuery(token, userId, expiresAt);
  return createdSession;

  async function runInsertQuery(token, userId, expiresAt) {
    const result = await database.query({
      text: `
      INSERT INTO
        sessions (token, user_id, expires_at)
      VALUES
        ($1, $2, $3)
      RETURNING
       *
      ;`,
      values: [token, userId, expiresAt],
    });

    return result.rows[0];
  }
}

const session = {
  create,
  EXPIRATION_IN_MILLIS,
};

export default session;
