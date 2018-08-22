import { Block, MetricsBase } from '../state';
import { Temperature } from '@/core/units';

export interface OneWireTempSensorBlock extends Block, MetricsBase {
  data: {
    address: string,
    offset: Temperature,
    value: Temperature,
    connected: boolean,
  }
}
