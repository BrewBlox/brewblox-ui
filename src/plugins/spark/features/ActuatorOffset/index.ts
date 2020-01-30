import { Link } from '@/helpers/units';
import { interfaceTypes } from '@/plugins/spark/block-types';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './ActuatorOffsetWidget.vue';
import { typeName } from './getters';
import { ActuatorOffsetData, OffsetSettingOrValue } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): ActuatorOffsetData => ({
    targetId: new Link(null, interfaceTypes.SetpointSensorPair),
    drivenTargetId: new Link(null, interfaceTypes.SetpointSensorPair, true),
    referenceId: new Link(null, interfaceTypes.SetpointSensorPair),
    referenceSettingOrValue: OffsetSettingOrValue.Setting,
    desiredSetting: 0,
    setting: 0,
    value: 0,
    constrainedBy: { constraints: [] },
    enabled: true,
  }),
  presets: [],
  changes: [
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
  ],
  graphTargets: {
    setting: 'Target offset',
    value: 'Actual offset',
  },
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Setpoint Driver',
  role: 'Output',
  component: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default { feature, block };
