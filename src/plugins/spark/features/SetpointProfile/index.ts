import { bloxLink } from '@/helpers/bloxfield';
import { shortDateString } from '@/helpers/functional';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockIntfType, BlockSpec, BlockType, SetpointProfileBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './SetpointProfileWidget.vue';

const typeName = BlockType.SetpointProfile;

const block: BlockSpec<SetpointProfileBlock> = {
  id: typeName,
  generate: () => ({
    start: new Date().getTime() / 1000,
    points: [],
    enabled: false,
    targetId: bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
    drivenTargetId: bloxLink(null),
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
      valueHint: 'seconds since 1/1/1970',
      pretty: (val: number): string => {
        if (val === 0) { return 'now'; }
        if (!val) { return 'invalid date'; }
        return shortDateString(val * 1000);
      },
    },
    {
      key: 'targetId',
      title: 'Target',
      component: 'LinkValEdit',
      generate: () => bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
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
