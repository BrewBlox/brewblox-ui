import { Link, Temp } from '@/plugins/spark/bloxfield';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector, serviceTemp } from '@/plugins/spark/helpers';
import { BlockSpec, FilterChoice, SetpointSensorPairBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './SetpointSensorPairWidget.vue';

const typeName = 'SetpointSensorPair';

const block: BlockSpec<SetpointSensorPairBlock> = {
  id: typeName,
  generate: (serviceId: string | null) => {
    const temp = serviceTemp(serviceId);
    return {
      sensorId: new Link(null, 'TempSensorInterface'),
      storedSetting: new Temp(null, temp),
      setting: new Temp(null, temp),
      value: new Temp(null, temp),
      valueUnfiltered: new Temp(null, temp),
      resetFilter: false,
      settingEnabled: true,
      filter: FilterChoice.FILTER_15s,
      filterThreshold: new Temp(5, 'delta_degC').convert(`delta_${temp}`),
    };
  },
  fields: [
    {
      key: 'storedSetting',
      title: 'Setting',
      component: 'UnitValEdit',
      generate: serviceId => new Temp(20, 'degC').convert(serviceTemp(serviceId)),
    },
    {
      key: 'settingEnabled',
      title: 'Enabled',
      component: 'BoolValEdit',
      generate: () => true,
    },
    {
      key: 'filterThreshold',
      title: 'Fast step threshold',
      component: 'UnitValEdit',
      generate: serviceId => new Temp(5, 'delta_degC').convert(`delta_${serviceTemp(serviceId)}`),
    },
    {
      key: 'sensorId',
      title: 'Linked Sensor',
      component: 'LinkValEdit',
      generate: () => new Link(null, 'TempSensorInterface'),
    },
    {
      key: 'setting',
      title: 'Setting (actual)',
      component: 'UnitValEdit',
      generate: serviceId => new Temp(20, 'degC').convert(serviceTemp(serviceId)),
      readonly: true,
      graphed: true,
    },
    {
      key: 'value',
      title: 'Sensor',
      component: 'UnitValEdit',
      generate: serviceId => new Temp(20, 'degC').convert(serviceTemp(serviceId)),
      readonly: true,
      graphed: true,
    },
    {
      key: 'valueUnfiltered',
      title: 'Sensor unfiltered',
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
  title: 'Setpoint',
  role: 'Process',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
