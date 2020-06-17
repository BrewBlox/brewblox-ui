import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector, prettifyConstraints } from '@/plugins/spark/helpers';
import { BlockSpec, MotorValveBlock } from '@/plugins/spark/types';
import { Link } from '@/plugins/spark/units';
import { WidgetFeature } from '@/store/features';

import widget from './MotorValveWidget.vue';

const typeName = 'MotorValve';

const block: BlockSpec<MotorValveBlock> = {
  id: typeName,
  generate: () => ({
    hwDevice: new Link(null, 'IoArrayInterface'),
    startChannel: 0,
    desiredState: 'Inactive',
    state: 'Inactive',
    valveState: 'InitIdle',
    constrainedBy: { constraints: [] },
  }),
  presets: [],
  fields: [
    {
      key: 'desiredState',
      title: 'State',
      component: 'StateValEdit',
      generate: () => 'Inactive',
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
      generate: () => 'Inactive',
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
