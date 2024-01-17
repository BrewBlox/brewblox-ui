export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retry(desc, func) {
  const start = new Date().getTime();
  while (new Date().getTime() < start + 5 * 60 * 1000) {
    try {
      return await func();
    } catch (e) {
      console.log(`Retrying "${desc}" after error,`, e.message);
      await sleep(1000);
    }
  }
  throw new Error(`Retry attempts exhausted: "${desc}"`);
}

export function objectSorter(key) {
  return (a, b) => {
    const left = a[key] ?? '';
    const right = b[key] ?? '';
    return left.localeCompare(right);
  };
}

export const host = 'http://localhost:9601';
export const history = `${host}/history/history`;
export const datastore = `${host}/history/datastore`;
export const fileDir = new URL('./presets', import.meta.url).pathname;
export const databases = ['brewblox-global', 'brewblox-ui-store'];
export const sparks = ['sparkey', 'spock'];
