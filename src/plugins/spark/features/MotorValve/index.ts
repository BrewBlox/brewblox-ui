import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector, prettifyConstraints } from '@/plugins/spark/helpers';
import { BlockSpec, DigitalState } from '@/plugins/spark/types';
import { Link } from '@/plugins/spark/units';
import { WidgetFeature } from '@/store/features';

import widget from './MotorValveWidget.vue';
import { MotorValveBlock, ValveState } from './types';

const typeName = 'MotorValve';

const block: BlockSpec<MotorValveBlock> = {
  id: typeName,
  generate: () => ({
    hwDevice: new Link(null, 'IoArrayInterface'),
    startChannel: 0,
    desiredState: DigitalState.Inactive,
    state: DigitalState.Inactive,
    valveState: ValveState.InitIdle,
    constrainedBy: { constraints: [] },
  }),
  presets: [],
  fields: [
    {
      key: 'desiredState',
      title: 'State',
      component: 'StateValEdit',
      generate: () => 0,
      pretty: v => DigitalState[v],
      graphed: true,
      graphName: 'Desired state',
    },
    {
      key: 'constrainedBy',
      title: 'Constraints',
      component: 'DigitalConstraintsValEdit',
      generate: () => ({ constraints: [] }),
      pretty: prettifyConstraints,
    },
    {
      key: 'state',
      title: 'Actual state',
      component: 'StateValEdit',
      generate: () => 0,
      pretty: v => DigitalState[v],
      readonly: true,
      graphed: true,
    },
  ],
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Motor Valve',
  role: 'Output',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
