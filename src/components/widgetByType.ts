import { DashboardItem } from '@/store/dashboards/state';

import MetricsWidget from '@/components/Metrics/MetricsWidget.vue';
import PidWidget from '@/features/Pid/PidWidget.vue';
import SensorSetPointPairWidget from '@/features/SensorSetPointPair/SensorSetPointPairWidget.vue';
import DefaultWidget from '@/components/Defaults/DefaultWidget.vue';

function widgetByType(type: String) {
  switch (type) {
    case 'Pid':
      return PidWidget;
    case 'Metrics':
      return MetricsWidget;
    case 'SensorSetPointPair':
      return SensorSetPointPairWidget;
    case 'OneWireTempSensor':
    case 'SetPointSimple':
    default:
      return DefaultWidget;
  }
}

export default function addWidgetByType(item: DashboardItem) {
  return {
    ...item,
    component: widgetByType(item.widget),
  };
}
