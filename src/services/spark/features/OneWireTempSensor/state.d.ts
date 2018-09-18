import { Block, MetricsBase } from '@/services/spark/state';
import { Temperature } from '@/helpers/units';

export interface OneWireTempSensorBlock extends Block, MetricsBase {
  data: {
    address: string,
    offset: Temperature,
    value: Temperature,
    connected: boolean,
  };
}
