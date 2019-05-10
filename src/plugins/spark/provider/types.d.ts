import { Block } from '@/plugins/spark/types';

export interface OneWireBusBlock extends Block {
  data: {
    command: {
      opcode: number;
      data: number;
    };
    address: string[];
  };
}

export interface GroupsBlock extends Block {
  data: {
    active: number[];
  };
}

export interface SysInfoBlock extends Block {
  data: {
    deviceId: string;
  };
}

export interface TicksBlock extends Block {
  data: {
    millisSinceBoot: number;
    secondsSinceEpoch: number;
  };
}

export interface WiFiSettingsBlock extends Block {
  data: {
    ssid: string;
    password: string;
    security: number;
    cipher: number;
    signal: number;
    ip: string;
  };
}
