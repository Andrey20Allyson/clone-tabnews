const cp = require("node:child_process");

const DEBUG_RESULTS = false;

const REPOSITORY = "zricethezav/gitleaks";
const TAG = "v8.22.1";

const DOCKER_OPTIONS = "-v $PWD:/path";
const COMMAND = 'protect --source="/path" --staged --verbose';

function main() {
  console.log("> Looking for staged secrets...");

  const [output, hasSecret] = runProtect();

  if (hasSecret) {
    process.stdout.write(output);
    console.log("> Secrets detected on staging");
    process.exit(1);
  }

  process.stdout.moveCursor(0, -1);
  process.stdout.cursorTo(0);
  process.stdout.clearScreenDown();
  process.exit(0);
}

function runProtect() {
  const result = run(
    `docker run --rm ${DOCKER_OPTIONS} ${REPOSITORY}:${TAG} ${COMMAND}`
  );

  const hasSecret = result.status !== 0;

  return [result.stdout?.toString("utf8"), hasSecret];
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
