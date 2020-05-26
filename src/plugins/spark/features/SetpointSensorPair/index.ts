import { genericBlockFeature } from '@/plugins/spark/generic';
import { userUnitChoices } from '@/plugins/spark/getters';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { Link, Unit } from '@/plugins/spark/units';
import { WidgetFeature } from '@/store/features';

import widget from './SetpointSensorPairWidget.vue';
import { FilterChoice, SetpointSensorPairBlock } from './types';

const typeName = 'SetpointSensorPair';

const block: BlockSpec<SetpointSensorPairBlock> = {
  id: typeName,
  generate: () => ({
    sensorId: new Link(null, 'TempSensorInterface'),
    storedSetting: new Unit(null, 'degC'),
    setting: new Unit(null, 'degC'),
    value: new Unit(null, 'degC'),
    valueUnfiltered: new Unit(null, 'degC'),
    resetFilter: false,
    settingEnabled: true,
    filter: FilterChoice.Filter15s,
    filterThreshold: new Unit(5, 'delta_degC'),
  }),
  fields: [
    {
      key: 'storedSetting',
      title: 'Setting',
      component: 'UnitValEdit',
      componentProps: { units: userUnitChoices.Temp },
      generate: () => new Unit(20, 'degC'),
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
      generate: () => new Unit(2, 'degC'),
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
      generate: () => new Unit(20, 'degC'),
      readonly: true,
      graphed: true,
    },
    {
      key: 'value',
      title: 'Sensor',
      component: 'UnitValEdit',
      componentProps: { units: userUnitChoices.Temp },
      generate: () => new Unit(20, 'degC'),
      readonly: true,
      graphed: true,
    },
    {
      key: 'valueUnfiltered',
      title: 'Sensor unfiltered',
      component: 'UnitValEdit',
      componentProps: { units: userUnitChoices.Temp },
      generate: () => new Unit(20, 'degC'),
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
