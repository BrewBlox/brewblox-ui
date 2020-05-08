import { matchesType } from '@/helpers/functional';

import { AlwaysFalseImpl, AutomationSpec } from '../../types';
import AlwaysFalse from './AlwaysFalse.vue';

const type = 'AlwaysFalse';

const spec: AutomationSpec<AlwaysFalseImpl> = {
  type: 'AlwaysFalse',
  title: 'Always false',
  component: AlwaysFalse,
  generate: () => ({
    type,
    desc: 'Wait for manual override',
  }),
  pretty: impl =>
    matchesType<AlwaysFalseImpl>(type, impl)
      ? 'Always false: requires manual override'
      : 'Invalid implementation data',
};

export default spec;
