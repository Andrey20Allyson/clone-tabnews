const cp = require("node:child_process");

const progress = {
  idx: 0,
  chars: ["/", "-", "\\", "|"],
  next() {
    if (this.idx === this.chars.length) {
      this.idx = 0;
    }

    const char = this.chars[this.idx++];

    return char;
  },
};

const startTime = Date.now();

function getDutationTime() {
  const delta = Date.now() - startTime;

  const seconds = delta / 1000;

  return `${seconds.toFixed(1)}s`;
}

const yellow = "\u001B[33m";
const green = "\u001B[32m";
const cleanup = "\u001B[0m";

function checkPostgres() {
  cp.exec("docker exec postgres-dev pg_isready --host localhost", handleResult);
}

function handleResult(error, stdout) {
  if (stdout.search("accepting connections") === -1) {
    process.stdout.clearLine(0);
    console.log(
      `> ${progress.next()} ${yellow}Don't is accepting connections yet${cleanup} [ ${yellow}${getDutationTime()}${cleanup} ]`,
    );
    process.stdout.moveCursor(0, -1);

    return setTimeout(checkPostgres, 100);
  }

  process.stdout.clearLine(0);
  console.log(
    `> Postgres server is ${green}UP${cleanup} [${green}${getDutationTime()}${cleanup}]`,
  );
}

console.log("> Waiting for postgres database...");

checkPostgres();
