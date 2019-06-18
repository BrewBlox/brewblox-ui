import { ref } from '@/helpers/component-ref';
import { IoArrayLink } from '@/helpers/units/KnownLinks';
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
  presets: [],
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
