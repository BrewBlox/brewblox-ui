import { genericBlockFeature } from '@/plugins/spark/generic';
import { interfaceTypes } from '@/plugins/spark/getters';
import { blockWidgetSelector, prettifyConstraints } from '@/plugins/spark/helpers';
import { ActuatorOffsetBlock, BlockSpec } from '@/plugins/spark/types';
import { Link } from '@/plugins/spark/units';
import { WidgetFeature } from '@/store/features';

import widget from './ActuatorOffsetWidget.vue';

const typeName = 'ActuatorOffset';

const block: BlockSpec<ActuatorOffsetBlock> = {
  id: typeName,
  generate: () => ({
    targetId: new Link(null, interfaceTypes.SetpointSensorPair),
    drivenTargetId: new Link(null, interfaceTypes.SetpointSensorPair, true),
    referenceId: new Link(null, interfaceTypes.SetpointSensorPair),
    referenceSettingOrValue: 'Setting',
    desiredSetting: 0,
    setting: 0,
    value: 0,
    constrainedBy: { constraints: [] },
    enabled: true,
  }),
  fields: [
    {
      key: 'desiredSetting',
      title: 'Target offset',
      component: 'NumberValEdit',
      generate: () => 0,
    },
    {
      key: 'enabled',
      title: 'Enabled',
      component: 'BoolValEdit',
      generate: () => true,
    },
    {
      key: 'targetId',
      title: 'Target',
      component: 'LinkValEdit',
      generate: () => new Link(null, interfaceTypes.SetpointSensorPair),
    },
    {
      key: 'referenceId',
      title: 'Reference',
      component: 'LinkValEdit',
      generate: () => new Link(null, interfaceTypes.SetpointSensorPair),
    },
    {
      key: 'constrainedBy',
      title: 'Constraints',
      component: 'AnalogConstraintsValEdit',
      generate: () => ({ constraints: [] }),
      pretty: prettifyConstraints,
    },
    {
      key: 'setting',
      title: 'Target offset',
      generate: () => 0,
      component: 'NumberValEdit',
      readonly: true,
      graphed: true,
    },
    {
      key: 'value',
      title: 'Actual offset',
      generate: () => 0,
      component: 'NumberValEdit',
      readonly: true,
      graphed: true,
    },
  ],
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Setpoint Driver',
  role: 'Output',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default { feature, block };
