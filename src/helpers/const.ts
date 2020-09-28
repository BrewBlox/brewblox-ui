const devHostname = process.env.BLOX_API_HOST;
const devPort = process.env.BLOX_API_PORT;

export const HOSTNAME = process.env.DEV
  ? devHostname
  : window.location.hostname;

export const PORT = process.env.DEV
  ? Number(devPort)
  : Number(window.location.port);

export const HOST = process.env.DEV
  ? `https://${devHostname}:${devPort}`
  : `https://${window.location.host}`;
