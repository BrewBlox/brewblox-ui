import { ref } from '@/helpers/component-ref';
import { Unit } from '@/helpers/units';
import { TempSensorLink } from '@/helpers/units/KnownLinks';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec } from '../../types';
import { typeName } from './getters';
import form from './SetpointSensorPairForm.vue';
import widget from './SetpointSensorPairWidget.vue';
import { FilterChoice, SetpointSensorPairData } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): SetpointSensorPairData => ({
    sensorId: new TempSensorLink(null),
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
      generate: () => new TempSensorLink(null),
    },
  ],
  presets: [],
  graphTargets: {
    setting: 'Setting',
    value: 'Sensor',
    valueUnfiltered: 'Sensor unfiltered',
  },
};

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Setpoint',
  role: 'Process',
  widgetComponent: ref(widget),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
