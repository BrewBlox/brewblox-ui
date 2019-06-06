import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { BlockSpec } from '@/plugins/spark/types';
import { Feature } from '@/store/features';

import form from './ActuatorAnalogMockForm.vue';
import widget from './ActuatorAnalogMockWidget.vue';
import { typeName } from './getters';

const block: BlockSpec = {
  id: typeName,
  generate: () => ({
    setting: 0,
    minSetting: 0,
    maxSetting: 100,
    value: 0,
    minValue: 0,
    maxValue: 100,
  }),
  presets: [],
  changes: [
    {
      key: 'setting',
      title: 'Setting',
      component: 'NumberValEdit',
      generate: () => 0,
    },
    {
      key: 'minSetting',
      title: 'Minimum Setting',
      component: 'NumberValEdit',
      generate: () => 0,
    },
    {
      key: 'maxSetting',
      title: 'Maximum Setting',
      component: 'NumberValEdit',
      generate: () => 100,
    },
    {
      key: 'minValue',
      title: 'Minimum Value',
      component: 'NumberValEdit',
      generate: () => 0,
    },
    {
      key: 'maxValue',
      title: 'Maximum Value',
      component: 'NumberValEdit',
      generate: () => 100,
    },
  ],
};

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Analog Actuator (Mock)',
  role: 'Output',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export const blockStuff = {};

export default { feature, block };
