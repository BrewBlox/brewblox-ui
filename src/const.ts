const devHostname = process.env.BLOX_API_HOST;
const devPort = process.env.BLOX_API_PORT;

export const PROTOCOL = window.location.protocol.replace(':', '');
export const WS_PROTOCOL = PROTOCOL === 'https' ? 'wss' : 'ws';

export const HOSTNAME = process.env.DEV
  ? devHostname || window.location.hostname
  : window.location.hostname;

export const PORT = process.env.DEV
  ? Number(devPort)
  : Number(window.location.port) || (PROTOCOL === 'https' ? 443 : 80);

export const HOST = `${PROTOCOL}://${HOSTNAME}:${PORT}`;
export const WS_HOST = `${WS_PROTOCOL}://${HOSTNAME}:${PORT}`;

export const STATE_TOPIC = 'brewcast/state';
export const STORE_TOPIC = 'brewcast/datastore';
export const DEVICE_TOPIC = 'brewcast/device';

export const UI_NAMESPACE = 'brewblox-ui-store';
export const GLOBAL_NAMESPACE = 'brewblox-global';

export const IS_IOS =
  /iPad|iPhone|iPod/.test(navigator.platform) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
