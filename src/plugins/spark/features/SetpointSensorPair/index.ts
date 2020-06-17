import { genericBlockFeature } from '@/plugins/spark/generic';
import { userUnitChoices } from '@/plugins/spark/getters';
import { blockWidgetSelector, serviceTemp } from '@/plugins/spark/helpers';
import { BlockSpec, SetpointSensorPairBlock } from '@/plugins/spark/types';
import { Link, Temp } from '@/plugins/spark/units';
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
      filter: 'FILT_15s',
      filterThreshold: new Temp(5, 'delta_degC').convert(`delta_${temp}`),
    };
  },
  fields: [
    {
      key: 'storedSetting',
      title: 'Setting',
      component: 'UnitValEdit',
      componentProps: { units: userUnitChoices.Temp },
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
      componentProps: { units: userUnitChoices.Temp },
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
      title: 'Setting',
      component: 'UnitValEdit',
      componentProps: { units: userUnitChoices.Temp },
      generate: serviceId => new Temp(20, 'degC').convert(serviceTemp(serviceId)),
      readonly: true,
      graphed: true,
    },
    {
      key: 'value',
      title: 'Sensor',
      component: 'UnitValEdit',
      componentProps: { units: userUnitChoices.Temp },
      generate: serviceId => new Temp(20, 'degC').convert(serviceTemp(serviceId)),
      readonly: true,
      graphed: true,
    },
    {
      key: 'valueUnfiltered',
      title: 'Sensor unfiltered',
      component: 'UnitValEdit',
      componentProps: { units: userUnitChoices.Temp },
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
