const devHostname = process.env.BLOX_API_HOST;
const devUsed = process.env.BLOX_API_DEV;
const devPort = process.env.BLOX_API_PORT;

export const HOSTNAME = devUsed
  ? devHostname
  : window.location.hostname;

export const PORT = devUsed
  ? Number(devPort)
  : Number(window.location.port);

export const HOST = devUsed
  ? `https://${devHostname}:${devPort}`
  : `https://${window.location.host}`;
