import { Link, Unit } from '@/helpers/units';
import { interfaceTypes } from '@/plugins/spark/block-types';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import { typeName } from './getters';
import widget from './SetpointSensorPairWidget.vue';
import { FilterChoice, SetpointSensorPairData } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): SetpointSensorPairData => ({
    sensorId: new Link(null, interfaceTypes.TempSensor),
    storedSetting: new Unit(null, 'degC'),
    setting: new Unit(null, 'degC'),
    value: new Unit(null, 'degC'),
    valueUnfiltered: new Unit(null, 'degC'),
    resetFilter: false,
    settingEnabled: true,
    filter: FilterChoice.Filter15s,
    filterThreshold: new Unit(5, 'delta_degC'),
  }),
  changes: [
    {
      key: 'storedSetting',
      title: 'Setting',
      component: 'UnitValEdit',
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
      generate: () => new Unit(2, 'degC'),
    },
    {
      key: 'sensorId',
      title: 'Linked Sensor',
      component: 'LinkValEdit',
      generate: () => new Link(null, interfaceTypes.TempSensor),
    },
  ],
  presets: [],
  graphTargets: {
    setting: 'Setting',
    value: 'Sensor',
    valueUnfiltered: 'Sensor unfiltered',
  },
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Setpoint',
  role: 'Process',
  widgetComponent: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
