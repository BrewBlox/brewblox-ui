import { DashboardItem } from '@/store/dashboards/state';

import Pid from './Pid/Pid.vue';
import Metrics from './Metrics/Metrics.vue';
import SensorSetPointPair from './SensorSetPointPair/SensorSetPointPair.vue';
import Placeholder from './Placeholder.vue';

function componentByType(type: WidgetType) {
  switch (type) {
    case 'Pid':
      return Pid;
    case 'Metrics':
      return Metrics;
    case 'SensorSetPointPair':
      return SensorSetPointPair;
    case 'OneWireTempSensor':
    case 'SetPointSimple':
      return Placeholder;
    default:
      throw new Error('Invalid widget type');
  }
}

export default function addComponentByType(item: DashboardItem) {
  return {
    ...item,
    component: componentByType(item.widget),
  };
}
