import database from "infra/database.js";
import { defaultHandlerOptions } from "infra/generic-handlers";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(getHandler);

export default router.handler(defaultHandlerOptions);

async function getHandler(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseConnectionInfoQueryResult = await database.query({
    text: `SELECT 'PostgreSQL' AS dbms_name, * FROM
    (SELECT setting AS server_version FROM pg_settings WHERE name = 'server_version') q1,
    (SELECT count(*)::int AS opened_connections FROM pg_stat_activity WHERE datname = $1) q2,
    (SELECT setting::int AS max_connections FROM pg_settings WHERE name = 'max_connections') q3,
    (SELECT CURRENT_TIMESTAMP AS database_timestamp) q4;`,
    values: [process.env.POSTGRES_DB],
  });

  const databaseInfo = databaseConnectionInfoQueryResult.rows[0];

  const databaseServiceStatus = {
    service_status_updated_at: databaseInfo.database_timestamp,
    service_name: "database",

    database_management_system: databaseInfo.dbms_name,
    database_version: databaseInfo.server_version,
    database_max_connections: databaseInfo.max_connections,
    database_opened_connections: databaseInfo.opened_connections,
  };

  response.status(200).json({
    updated_at: updatedAt,
    services: [databaseServiceStatus],
  });
}
