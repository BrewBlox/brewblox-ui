import { Link } from '@/helpers/units';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { interfaceTypes } from '../../block-types';
import { blockWidgetSelector } from '../../helpers';
import { BlockSpec } from '../../types';
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

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Setpoint Driver',
  role: 'Output',
  widgetComponent: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default { feature, block };
