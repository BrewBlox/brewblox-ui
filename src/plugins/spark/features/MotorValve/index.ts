import { ref } from '@/helpers/component-ref';
import { IoArrayLink } from '@/helpers/units/KnownLinks';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec } from '../../types';
import form from './MotorValveForm.vue';
import widget from './MotorValveWidget.vue';
import { typeName } from './getters';

const block: BlockSpec = {
  id: typeName,
  generate: () => ({
    hwDevice: new IoArrayLink(null),
    startChannel: 0,
    state: 0,
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
  ],
};

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Motor Valve',
  role: 'Output',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
