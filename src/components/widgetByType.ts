import { DashboardItem } from '@/store/dashboards/state';

import MetricsWidget from '@/components/Metrics/MetricsWidget.vue';
import PidWidget from '@/features/Pid/PidWidget.vue';
import SensorSetPointPairWidget from '@/features/SensorSetPointPair/SensorSetPointPairWidget.vue';
import InactiveObjectWidget from '@/features/InactiveObject/InactiveObjectWidget.vue';
import DefaultWidget from '@/components/Defaults/DefaultWidget.vue';
import OneWireBusWidget from '@/features/OneWireBus/OneWireBusWidget.vue';
import OneWireTempSensorWidget from '@/features/OneWireTempSensor/OneWireTempSensorWidget.vue';


function widgetByType(type: String) {
  switch (type) {
    case 'Pid':
      return PidWidget;
    case 'Metrics':
      return MetricsWidget;
    case 'SensorSetPointPair':
      return SensorSetPointPairWidget;
    case 'InactiveObject':
      return InactiveObjectWidget;
    case 'OneWireBus':
      return OneWireBusWidget;
    case 'OneWireTempSensor':
      return OneWireTempSensorWidget;
    case 'SetPointSimple':
    default:
      return DefaultWidget;
  }
}

export default function addWidgetByType(item: DashboardItem): any {
  return {
    ...item,
    component: widgetByType(item.widget),
  };
}
