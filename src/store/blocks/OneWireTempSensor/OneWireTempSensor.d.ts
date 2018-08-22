import { Block, MetricsBase } from '../state';
import { Temperature } from '@/core/units';

export interface OneWireTempSensorBlock extends Block, MetricsBase {
  data: {
    settings: {
      address: string,
      offset: Temperature,
    };
    state: {
      value: Temperature,
      connected: boolean,
    };
  }
}
