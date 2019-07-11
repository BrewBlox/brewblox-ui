import { ref } from '@/helpers/component-ref';
import { SetpointSensorPairLink } from '@/helpers/units/KnownLinks';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec } from '../../types';
import form from './ActuatorOffsetForm.vue';
import widget from './ActuatorOffsetWidget.vue';
import { typeName } from './getters';
import { ActuatorOffsetData, OffsetSettingOrValue } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): ActuatorOffsetData => ({
    targetId: new SetpointSensorPairLink(null),
    drivenTargetId: new SetpointSensorPairLink(null, true),
    referenceId: new SetpointSensorPairLink(null),
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
      key: 'setting',
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
      generate: () => new SetpointSensorPairLink(null),
    },
    {
      key: 'referenceId',
      title: 'Reference',
      component: 'LinkValEdit',
      generate: () => new SetpointSensorPairLink(null),
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
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default { feature, block };
