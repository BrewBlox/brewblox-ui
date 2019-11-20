import { Link } from '@/helpers/units';
import { interfaceTypes } from '@/plugins/spark/block-types';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec, DigitalState } from '@/plugins/spark/types';
import { Feature } from '@/store/features';

import { typeName } from './getters';
import widget from './MotorValveWidget.vue';
import { MotorValveData, ValveState } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): MotorValveData => ({
    hwDevice: new Link(null, interfaceTypes.IoArray),
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
  ...genericBlockFeature,
  id: typeName,
  displayName: 'Motor Valve',
  role: 'Output',
  widgetComponent: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
