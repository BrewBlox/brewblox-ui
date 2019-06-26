import { typeName } from '@/plugins/spark/features/Pid/getters';

import { defaultSpec } from '../getters';
import { ComponentSpec } from '../types';;

const SIZE_X = 1;
const SIZE_Y = 1;

const spec: ComponentSpec = {
  ...defaultSpec,
  cards: [{
    component: 'LinkedBlockCard',
    props: { settingsKey: 'pid', typeName },
  }],
  size: () => [SIZE_X, SIZE_Y],
};

export default spec;
