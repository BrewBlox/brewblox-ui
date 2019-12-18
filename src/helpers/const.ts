
export const HOST = process.env.BLOX_API_PORT
  ? `https://${window.location.hostname}:${process.env.BLOX_API_PORT}`
  : `https://${window.location.host}`;
