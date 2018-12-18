import { Block } from '@/plugins/spark/state';
import { blockIds } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';

export const widgetSize = {
  cols: 4,
  rows: 4,
};

export const sysInfoId = '__sysinfo';
export const profilesId = '__profiles';
export const oneWireBusId = '__onewirebus';
export const ticksId = '__time';
export const wifiId = '__wifisettings';
export const touchId = '__touchsettings';

export const isSystemBlock = (block: Block) =>
  [
    sysInfoId,
    profilesId,
    oneWireBusId,
    ticksId,
    wifiId,
    touchId,
  ].includes(block.id);

export const isReady = (store: RootStore, serviceId: string) =>
  [
    sysInfoId,
    profilesId,
    oneWireBusId,
    ticksId,
  ].every(id => blockIds(store, serviceId).includes(id));

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
