import { ref } from '@/helpers/component-ref';
import { Link } from '@/helpers/units';
import { SetpointSensorPairLink } from '@/helpers/units/KnownLinks';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec } from '../../types';
import { typeName } from './getters';
import form from './SetpointProfileForm.vue';
import widget from './SetpointProfileWidget.vue';
import { SetpointProfileData } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): SetpointProfileData => ({
    start: new Date().getTime() / 1000,
    points: [],
    enabled: false,
    targetId: new SetpointSensorPairLink(null),
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
      pretty: val => new Date((val || 0) * 1000).toLocaleString(),
    },
    {
      key: 'targetId',
      title: 'Target',
      component: 'LinkValEdit',
      generate: () => new SetpointSensorPairLink(null),
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

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Setpoint profile',
  role: 'Process',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default { feature, block };
