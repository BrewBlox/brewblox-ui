export const HOSTNAME = __BREWBLOX_API_HOST || window.location.hostname;
export const PROTOCOL: 'https' | 'http' =
  __BREWBLOX_API_PROTOCOL || (window.location.protocol.replace(':', '') as any);
export const WS_PROTOCOL = PROTOCOL === 'https' ? 'wss' : 'ws';

export const PORT =
  Number(__BREWBLOX_API_PORT) ||
  Number(window.location.port) ||
  (PROTOCOL === 'https' ? 443 : 80);

export const HOST = `${PROTOCOL}://${HOSTNAME}:${PORT}`;
export const WS_HOST = `${WS_PROTOCOL}://${HOSTNAME}:${PORT}`;

export const STATE_TOPIC = 'brewcast/state';
export const STORE_TOPIC = 'brewcast/datastore';
export const DEVICE_TOPIC = 'brewcast/device';

export const UI_NAMESPACE = 'brewblox-ui-store';
export const GLOBAL_NAMESPACE = 'brewblox-global';

export const DASHBOARD_NAMESPACE = `${UI_NAMESPACE}:dashboards`;
export const SERVICE_NAMESPACE = `${UI_NAMESPACE}:services`;
export const SYSTEM_NAMESPACE = `${UI_NAMESPACE}:system-config`;
export const WIDGET_NAMESPACE = `${UI_NAMESPACE}:dashboard-items`;
export const FOLDER_NAMESPACE = `${UI_NAMESPACE}:folders`;

export const LAYOUT_NAMESPACE = `${UI_NAMESPACE}:layouts`;
export const SESSION_NAMESPACE = `${UI_NAMESPACE}:logged-sessions`;
export const SPARK_SNIPPET_NAMESPACE = `${UI_NAMESPACE}:spark-presets`;

const { userAgent, platform, maxTouchPoints } = navigator;

export const IS_CHROME = userAgent.indexOf('Chrome') > -1;
export const IS_FIREFOX = userAgent.indexOf('Firefox') > -1;
export const IS_SAFARI = !IS_CHROME && userAgent.indexOf('Safari') > -1;

export const IS_APPLE = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
export const IS_WEBKIT = IS_SAFARI || IS_APPLE;

export const IS_IOS =
  import.meta.env.MODE !== 'test'
    ? /iPad|iPhone|iPod/.test(platform) ||
      (platform === 'MacIntel' && maxTouchPoints > 1)
    : false;

export const AUTH_REFRESH_INTERVAL_MS = 10 * 60 * 1000;
