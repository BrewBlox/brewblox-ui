import type { Block } from './block-types';

export interface OneWireBusBlock extends Block {
  type: 'OneWireBus';
  data: {
    command: {
      opcode: number;
      data: number;
    };
    address: string[];
  };
}

export interface GroupsBlock extends Block {
  type: 'Groups';
  data: {
    active: number[];
  };
}

export type SparkPlatform =
  | 'unknown_platform'
  | 'gcc'
  | 'photon'
  | 'p1'

export interface SysInfoBlock extends Block {
  type: 'SysInfo';
  data: {
    deviceId: string;
    version: string;
    platform: SparkPlatform;
    protocolVersion: string;
    releaseDate: string;
    protocolDate: string;
  };
}

export interface TicksBlock extends Block {
  type: 'Ticks';
  data: {
    millisSinceBoot: number;
    secondsSinceEpoch: number;
  };
}

export type WifiSecurityType =
  | 'WLAN_SEC_UNSEC'
  | 'WLAN_SEC_WEP'
  | 'WLAN_SEC_WPA'
  | 'WLAN_SEC_WPA2'
  | 'WLAN_SEC_WPA_ENTERPRISE'
  | 'WLAN_SEC_WPA2_ENTERPRISE'
  | 'WLAN_SEC_NOT_SET'

export type WifiCipherType =
  | 'WLAN_CIPHER_NOT_SET'
  | 'WLAN_CIPHER_AES'
  | 'WLAN_CIPHER_TKIP'
  | 'WLAN_CIPHER_AES_TKIP' // OR of AES and TKIP

export interface WiFiSettingsBlock extends Block {
  type: 'WiFiSettings';
  data: {
    ssid: string;
    password: string;
    security: WifiSecurityType;
    cipher: WifiCipherType;
    signal: number;
    ip: string;
  };
}

export type TouchCalibrated =
  | 'NO'
  | 'YES'
  | 'NEW'

export interface TouchSettingsBlock extends Block {
  type: 'TouchSettings';
  data: {
    calibrated: TouchCalibrated;
    xOffset: number;
    yOffset: number;
    xBitsPerPixelX16: number;
    yBitsPerPixelX16: number;
  };
}
