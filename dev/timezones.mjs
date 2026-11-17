// Writes src/assets/timezones.json from this machine's tzdata: each zone's POSIX TZ string, the
// footer of its TZif file, which is all a Spark's clock takes.
// The names are the file's own, so a zone a Spark may have stored stays listed, and those of
// tzdata's zone.tab. A name tzdata keeps only as a link takes its target's string (tzdata.zi).
// The Spark 2 and 3 parse a DST rule only in its M form, so another form fails the run.
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

const zoneinfo = process.env.ZONEINFO ?? '/usr/share/zoneinfo';
const output = fileURLToPath(
  new URL('../src/assets/timezones.json', import.meta.url),
);

const lines = (file) => readFileSync(`${zoneinfo}/${file}`, 'utf8').split('\n');

const links = Object.fromEntries(
  lines('tzdata.zi')
    .filter((line) => line.startsWith('L '))
    .map((line) => {
      const [, target, link] = line.split(' ');
      return [link, target];
    }),
);

const zoneTab = lines('zone.tab')
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => line.split('\t')[2]);

const names = [
  ...new Set([...Object.keys(JSON.parse(readFileSync(output))), ...zoneTab]),
].sort();

function posixString(name) {
  const file = existsSync(`${zoneinfo}/${name}`) ? name : links[name];
  if (!file) {
    throw new Error(`${name} is neither a zone nor a link in ${zoneinfo}`);
  }
  const tzif = readFileSync(`${zoneinfo}/${file}`, 'latin1');
  const posix = /\n([^\n]*)\n$/.exec(tzif)?.[1] ?? '';
  const rules = posix.split(',').slice(1);
  if (!posix || rules.some((rule) => !rule.startsWith('M'))) {
    throw new Error(
      `${name}: "${posix}" is not a string a Spark 2 or 3 parses`,
    );
  }
  return posix;
}

const timezones = Object.fromEntries(names.map((n) => [n, posixString(n)]));
writeFileSync(output, JSON.stringify(timezones, undefined, 2) + '\n');
console.log(`${names.length} zones written to ${output}`);
