import "./toBeArray";
import "./toBeTypeof";
import "./date";

import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});
