import { AlwaysFalseImpl, AutomationSpec } from '../../types';
import AlwaysFalse from './AlwaysFalse.vue';

const spec: AutomationSpec<AlwaysFalseImpl> = {
  type: 'AlwaysFalse',
  title: 'Always false',
  generate: () => ({
    type: 'AlwaysFalse',
    desc: 'Wait for manual override',
  }),
  component: AlwaysFalse,
};

export default spec;
