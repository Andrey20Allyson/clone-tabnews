test("GET to /api/v1/status should return the API Status", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");

  // response assertions
  expect(response.status).toBe(200);

  // status assertions
  const apiStatus = await response.json();

  // status updated_at assertions
  expect(apiStatus.updated_at).toBeDefined();
  expect(apiStatus.updated_at).toBeDateISOString();

  // services assertions
  expect(apiStatus.services).toBeDefined();
  expect(apiStatus.services).toBeArray();

  // database service status assertions
  const databaseService = apiStatus.services.find(
    (service) => service.service_name === "database"
  );

  expect(databaseService).toBeDefined();

  // property assertions
  expect(databaseService.service_status_updated_at).toBeDefined();
  expect(databaseService.database_management_system).toBeDefined();
  expect(databaseService.database_version).toBeDefined();
  expect(databaseService.database_max_connections).toBeDefined();
  expect(databaseService.database_opened_connections).toBeDefined();

  // type assertions
  expect(databaseService.service_status_updated_at).toBeDateISOString();
  expect(databaseService.database_management_system).toBeTypeof("string");
  expect(databaseService.database_version).toBeTypeof("string");
  expect(databaseService.database_max_connections).toBeInt();
  expect(databaseService.database_opened_connections).toBeInt();

  expect(databaseService.database_opened_connections).toBe(1);
});
