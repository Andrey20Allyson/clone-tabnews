const cp = require("node:child_process");

const DEBUG_RESULTS = false;

const REPOSITORY = "zricethezav/gitleaks";
const TAG = "v8.22.1";

const DOCKER_OPTIONS = "-v $PWD:/path";
const COMMAND = 'protect --source="/path" --staged --verbose';

function main() {
  if (!hasImage()) {
    pullImage();
  }

  const [output, foundSecret] = runProtect();

  if (foundSecret) {
    console.log("> Failed on secrets leak detection");
    process.stdout.write(output);
    process.exit(1);
  }

  console.log("No Secrets Detected");
}

function hasImage() {
  const result = run("docker images --format json");

  return result.stdout
    .toString("utf8")
    .split("\n")
    .filter((str) => str.length > 0)
    .map(JSON.parse)
    .some((image) => image.Repository === REPOSITORY && image.Tag === TAG);
}

function pullImage() {
  const result = run(`docker pull ${REPOSITORY}:${TAG}`);

  if (result.status !== 0) {
    throw new Error(result.stderr.toString("utf8"));
  }

  process.stdout.write(result.stdout);
}

function runProtect() {
  const result = run(
    `docker run --rm ${DOCKER_OPTIONS} ${REPOSITORY}:${TAG} ${COMMAND}`
  );

  const foundSecret = result.status !== 0;

  return [result.stdout.toString("utf8"), foundSecret];
}

function logSpawnResult(result) {
  console.log("> exitCode:", result.status);
  console.log(`> stdout:\n${result.stdout?.toString("utf8")}> stdout end`);
  console.log(`> stderr:\n${result.stderr?.toString("utf8")}> stderr end`);

  return result;
}

function run(command) {
  if (DEBUG_RESULTS) {
    console.log(`>> runned: '${command}'`);
  }

  const result = cp.spawnSync(command, { shell: "sh" });

  if (DEBUG_RESULTS) {
    logSpawnResult(result);
  }

  return result;
}

main();
