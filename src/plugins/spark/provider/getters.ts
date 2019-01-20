import { Block } from '@/plugins/spark/state';
import { blockValues } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';

export const widgetSize = {
  cols: 4,
  rows: 2,
};

export const sysInfoType = 'SysInfo';
export const groupsType = 'Groups';
export const oneWireBusType = 'OneWireBus';
export const ticksType = 'Ticks';
export const wifiType = 'WiFiSettings';
export const touchType = 'TouchSettings';

export const isSystemBlock = (block: Block) => [
  sysInfoType,
  groupsType,
  oneWireBusType,
  ticksType,
  wifiType,
  touchType,
]
  .includes(block.type);

export const isReady = (store: RootStore, serviceId: string) => [
  sysInfoType,
  groupsType,
  oneWireBusType,
  ticksType,
]
  .every(t => blockValues(store, serviceId).some((b: Block) => b.type === t));

export const WlanSecurityEnum = [
  [0, 'Unsecured'],
  [1, 'WEP'],
  [2, 'WPA'],
  [3, 'WPA2'],
  [4, 'Enterprise WPA'],
  [5, 'Enterprise WPA2'],
  [255, 'Not Set'],
];

export const WlanCipherEnum = [
  [0, 'Auto'],
  [1, 'AES'],
  [2, 'TKIP'],
  [3, 'AES or TKIP'],
];

// source: https://www.adriangranados.com/blog/dbm-to-percent-conversion
export const calcWiFiPct = (dbm: number) => {
  if (dbm < -92) {
    return 1;
  }
  if (dbm > -21) {
    return 100;
  }
  return Math.round(((-0.0154 * dbm * dbm) - (0.3794 * dbm)) + 98.182);
};
