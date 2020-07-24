import { Temp } from '@/plugins/spark/bloxfield';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector, serviceTemp } from '@/plugins/spark/helpers';
import { BlockSpec, TempSensorMockBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './TempSensorMockWidget.vue';

const typeName = 'TempSensorMock';

const block: BlockSpec<TempSensorMockBlock> = {
  id: typeName,
  generate: serviceId => {
    const temp = serviceTemp(serviceId);
    return {
      value: new Temp(20, 'degC').convert(temp),
      setting: new Temp(20, 'degC').convert(temp),
      fluctuations: [],
      connected: true,
    };
  },
  fields: [
    {
      key: 'setting',
      title: 'Sensor Setting',
      component: 'UnitValEdit',
      generate: serviceId => new Temp(20, 'degC').convert(serviceTemp(serviceId)),
    },
    {
      key: 'connected',
      title: 'Connected',
      component: 'BoolValEdit',
      generate: () => true,
    },
    {
      key: 'value',
      title: 'Sensor value',
      component: 'UnitValEdit',
      generate: serviceId => new Temp(20, 'degC').convert(serviceTemp(serviceId)),
      readonly: true,
      graphed: true,
    },
  ],
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Temp Sensor (Mock)',
  role: 'Process',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default { feature, block };
