import { ref } from '@/helpers/component-ref';
import { Link,Unit } from '@/helpers/units';
import { TempSensorLink } from '@/helpers/units/KnownLinks';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec } from '../../types';
import form from './SetpointSensorPairForm.vue';
import widget from './SetpointSensorPairWidget.vue';
import { typeName } from './getters';

const block: BlockSpec = {
  id: typeName,
  generate: () => ({
    sensorId: new TempSensorLink(null),
    setting: new Unit(null, 'degC'),
    value: new Unit(null, 'degC'),
    settingEnabled: true,
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
      key: 'sensorId',
      title: 'Linked Sensor',
      component: 'LinkValEdit',
      generate: () => new Link(null),
    },
  ],
  presets: [],
};

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Sensor/Setpoint Pair',
  role: 'Process',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
