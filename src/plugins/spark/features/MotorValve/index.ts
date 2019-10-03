import { ref } from '@/helpers/component-ref';
import { IoArrayLink } from '@/helpers/units/KnownLinks';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec, DigitalState } from '../../types';
import { typeName } from './getters';
import form from './MotorValveForm.vue';
import widget from './MotorValveWidget.vue';
import { MotorValveData, ValveState } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): MotorValveData => ({
    hwDevice: new IoArrayLink(null),
    startChannel: 0,
    desiredState: DigitalState.Inactive,
    state: DigitalState.Inactive,
    valveState: ValveState.InitIdle,
    constrainedBy: { constraints: [] },
  }),
  presets: [],
  changes: [
    {
      key: 'desiredState',
      title: 'State',
      component: 'StateValEdit',
      generate: () => 0,
      pretty: v => DigitalState[v],
    },
  ],
  graphTargets: {
    state: 'Actual state',
    desiredState: 'Desired state',
  },
};

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Motor Valve',
  role: 'Output',
  widgetComponent: ref(widget),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
