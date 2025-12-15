import { execSync } from 'child_process';

enum MigrationCommand {
  GENERATE = 'generate',
  SHOW = 'show',
  RUN = 'run',
  REVERT = 'revert',
}

const MIGRATIONS_DIR = 'apps/migrations/src/migrations';
const DATA_SOURCE = 'apps/migrations/src/data-source.ts';
const DOCKER_SERVICE = 'migrations';

const args = process.argv.slice(2);

let command: MigrationCommand = MigrationCommand.GENERATE;
let migrationName = 'init';
let useDocker = false;
const extraFlags: string[] = [];

for (const arg of args) {
  if (arg === '--docker') useDocker = true;
  else if (Object.values(MigrationCommand).includes(arg as MigrationCommand)) {
    command = arg as MigrationCommand;
  } else if (arg.startsWith('--')) {
    extraFlags.push(arg);
  } else {
    migrationName = arg;
  }
}

function buildCommand(): string {
  switch (command) {
    case MigrationCommand.GENERATE:
      return useDocker
        ? `docker compose run --rm ${DOCKER_SERVICE} npm run migrations:generate ${migrationName} ${extraFlags.join(' ')}`
        : `tsx ./node_modules/typeorm/cli.js migration:generate ${MIGRATIONS_DIR}/${migrationName} -d ${DATA_SOURCE} ${extraFlags.join(' ')}`;

    case MigrationCommand.SHOW:
    case MigrationCommand.RUN:
    case MigrationCommand.REVERT:
      return useDocker
        ? `docker compose run --rm ${DOCKER_SERVICE} npm run migrations:${command} ${extraFlags.join(' ')}`
        : `tsx ./node_modules/typeorm/cli.js migration:${command} -d ${DATA_SOURCE} ${extraFlags.join(' ')}`;

    default:
      throw new Error(`Unknown command: ${command as MigrationCommand}`);
  }
}

const cmd = buildCommand();
console.log('Running:', cmd);
execSync(cmd, { stdio: 'inherit' });
