import { ref } from '@/helpers/component-ref';
import { Link } from '@/helpers/units';
import { interfaceTypes } from '@/plugins/spark/block-types';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import { typeName } from './getters';
import ProfilePresetAction from './ProfilePresetAction.vue';
import ProfilePresetDialog from './ProfilePresetDialog.vue';
import widget from './SetpointProfileWidget.vue';
import { SetpointProfileData } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): SetpointProfileData => ({
    start: new Date().getTime() / 1000,
    points: [],
    enabled: false,
    targetId: new Link(null, interfaceTypes.SetpointSensorPair),
    drivenTargetId: new Link(null),
  }),
  changes: [
    {
      key: 'enabled',
      title: 'Enabled',
      component: 'BoolValEdit',
      generate: () => true,
    },
    {
      key: 'start',
      title: 'Start Time',
      component: 'DateValEdit',
      componentProps: { timeScale: 1000 },
      generate: () => new Date().getTime() / 1000,
      pretty: (val: number): string => {
        if (val === 0) { return 'now'; }
        if (!val) { return 'invalid date'; }
        return new Date(val * 1000).toLocaleString();
      },
    },
    {
      key: 'targetId',
      title: 'Target',
      component: 'LinkValEdit',
      generate: () => new Link(null, interfaceTypes.SetpointSensorPair),
    },
  ],
  presets: [
    {
      name: 'Empty profile',
      generate: () => ({
        points: [],
        enabled: true,
        start: new Date().getTime() / 1000,
      }),
    },
  ],
};

ref(ProfilePresetAction);
ref(ProfilePresetDialog);

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Setpoint Profile',
  role: 'Process',
  widgetComponent: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default { feature, block };
