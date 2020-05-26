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

export interface SysInfoBlock extends Block {
  type: 'SysInfo';
  data: {
    deviceId: string;
    platform: number;
    hardware: number;
    voltage5: number;
    voltage12: number;
    version: string;
    releaseDate: string;
    protocolVersion: string;
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

export interface WiFiSettingsBlock extends Block {
  type: 'WiFiSettings';
  data: {
    ssid: string;
    password: string;
    security: number;
    cipher: number;
    signal: number;
    ip: string;
  };
}

export interface TouchSettingsBlock extends Block {
  type: 'TouchSettings';
  data: {
    calibrated: number;
    xOffset: number;
    yOffset: number;
    xBitsPerPixelX16: number;
    yBitsPerPixelX16: number;
  };
}
