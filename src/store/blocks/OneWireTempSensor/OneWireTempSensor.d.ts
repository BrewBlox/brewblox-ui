import { Block, MetricsBase } from '../state';
import { Temperature } from '@/core/units';

export interface OneWireTempSensor extends Block, MetricsBase {
  settings: {
    address: string,
    offset: Temperature,
  };
  state: {
    value: Temperature,
    connected: boolean,
  };
}
