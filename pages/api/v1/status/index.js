import database from "infra/database.js";

export default async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseServiceStatusUpdatedAt = new Date().toISOString();

  const databaseConnectionInfoQueryResult = await database.query(
    `select 'PostgreSQL' as dbms_name, * from
      (select setting AS server_version from pg_settings where name = 'server_version') q1,
      (select count(*)::int AS opened_connections from pg_stat_activity) q2,
      (select setting::int AS max_connections from pg_settings where name = 'max_connections') q3;`
  );

  const databaseInfo = databaseConnectionInfoQueryResult.rows[0];

  const databaseServiceStatus = {
    service_status_updated_at: databaseServiceStatusUpdatedAt,
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
