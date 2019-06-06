import { ref } from '@/helpers/component-ref';
import { Unit } from '@/helpers/units';
import { DS2413Link } from '@/helpers/units/KnownLinks';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec } from '../../types';
import form from './ActuatorDS2413Form.vue';
import widget from './ActuatorDS2413Widget.vue';
import { typeName } from './getters';

const block: BlockSpec = {
  id: typeName,
  generate: () => ({
    hwDevice: new DS2413Link(null),
    channel: 0,
    state: 0,
    constrainedBy: { constraints: [] },
  }),
  presets: [
    {
      name: 'Fridge Compressor',
      generate: () => ({
        label: 'Fridge compressor',
        value: {
          hwDevice: new DS2413Link(null),
          channel: 0,
          state: 0,
          constrainedBy: {
            constraints: [
              { minOff: new Unit(300, 'second') },
              { minOn: new Unit(180, 'second') },
            ],
          },
        },
      }),
    },
  ],
  changes: [
    {
      key: 'state',
      title: 'State',
      component: 'StateValEdit',
      generate: () => 0,
    },
    {
      key: 'invert',
      title: 'Invert',
      component: 'BoolValEdit',
      generate: () => false,
    },
  ],
};

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'DS2413 Actuator',
  role: 'Output',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
