import { DashboardItem } from '@/store/dashboards/state';

import PID from './PID/PID.vue';
import Placeholder from './Placeholder.vue';

function componentByType(type: WidgetType) {
  switch (type) {
    case 'PID':
      return PID;
    case 'Empty':
    case 'SensorSetPointPair':
      return Placeholder;
    default:
      throw new Error('Invalid widget type');
  }
}

export function addComponentByType(item: DashboardItem) {
  return {
    ...item,
    component: componentByType(item.widget),
  };
}
