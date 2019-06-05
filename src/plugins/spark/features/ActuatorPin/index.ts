import { ref } from '@/helpers/component-ref';
import { Unit } from '@/helpers/units';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec } from '../../types';
import form from './ActuatorPinForm.vue';
import widget from './ActuatorPinWidget.vue';
import { typeName } from './getters';

const block: BlockSpec = {
  id: typeName,
  generate: () => ({
    state: 2,
    invert: false,
    constrainedBy: { constraints: [], unconstrained: 0 },
  }),
  presets: [
    {
      name: 'Fridge Compressor',
      generate: () => ({
        state: 0,
        invert: false,
        constrainedBy: {
          constraints: [
            { minOff: new Unit(300, 'second') },
            { minOn: new Unit(180, 'second') },
          ],
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
  displayName: 'Pin Actuator',
  role: 'Output',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
  // Pins are static system objects, and can't be created or deleted
  wizard: undefined,
  deleters: undefined,
};

export default { feature, block };
