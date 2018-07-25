import { DashboardItem } from '@/store/dashboards/state';

import PID from './PID/PID.vue';
import Metrics from './Metrics/Metrics.vue';
import Placeholder from './Placeholder.vue';

function componentByType(type: WidgetType) {
  switch (type) {
    case 'PID':
      return PID;
    case 'Metrics':
      return Metrics;
    case 'OneWireTempSensor':
    case 'SetPointSimple':
    case 'SensorSetPointPair':
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
