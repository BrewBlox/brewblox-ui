import { ref } from '@/helpers/component-ref';
import { Unit } from '@/helpers/units';
import { IoArrayLink, MutexLink } from '@/helpers/units/KnownLinks';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec, DigitalState } from '../../types';
import form from './DigitalActuatorForm.vue';
import widget from './DigitalActuatorWidget.vue';
import { typeName } from './getters';
import { DigitalActuatorData } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): DigitalActuatorData => ({
    hwDevice: new IoArrayLink(null),
    channel: 0,
    desiredState: DigitalState.Inactive,
    state: DigitalState.Inactive,
    invert: false,
    constrainedBy: { constraints: [] },
  }),
  presets: [
    {
      name: 'Fridge cooler (compressor)',
      generate: (): Partial<DigitalActuatorData> => ({
        invert: false,
        constrainedBy: {
          constraints: [
            { minOff: new Unit(300, 'second'), limiting: false },
            { minOn: new Unit(180, 'second'), limiting: false },
            { mutex: new MutexLink(null), limiting: false },
          ],
        },
      }),
    },
    {
      name: 'Fridge heater',
      generate: (): Partial<DigitalActuatorData> => ({
        invert: false,
        constrainedBy: {
          constraints: [
            { mutex: new MutexLink(null), limiting: false },
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
  displayName: 'Digital Actuator',
  role: 'Output',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
