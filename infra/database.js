import { Client } from "pg";
import { ServiceError } from "./errors";

async function query(queryObject) {
  let client;

  try {
    client = await getConnectedClient();
    const result = await client.query(queryObject);

    return result;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      message: "Erro na conexão com Banco ou na Query",
      cause: error,
    });

    throw serviceErrorObject;
  } finally {
    await client?.end();
  }
}

async function getConnectedClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER + "2",
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValues(),
  });

  await client.connect();

  return client;
}

function getSSLValues() {
  if (process.env.POSTGRES_CA != null) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }

  return process.env.NODE_ENV === "production" ? true : false;
}

const database = {
  query,
  getConnectedClient,
};

export default database;
