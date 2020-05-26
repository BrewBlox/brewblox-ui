import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { Link } from '@/plugins/spark/units';
import { WidgetFeature } from '@/store/features';

import widget from './SetpointProfileWidget.vue';
import { SetpointProfileBlock } from './types';

const typeName = 'SetpointProfile';

const block: BlockSpec<SetpointProfileBlock> = {
  id: typeName,
  generate: () => ({
    start: new Date().getTime() / 1000,
    points: [],
    enabled: false,
    targetId: new Link(null, 'SetpointSensorPairInterface'),
    drivenTargetId: new Link(null),
  }),
  fields: [
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
      generate: () => new Link(null, 'SetpointSensorPairInterface'),
    },
  ],
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Setpoint Profile',
  role: 'Process',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default { feature, block };
