import { AutomationSpec, TimeElapsedImpl } from '../../types';
import TimeElapsed from './TimeElapsed.vue';

const spec: AutomationSpec<TimeElapsedImpl> = {
  type: 'TimeElapsed',
  title: 'Duration',
  generate: () => ({
    type: 'TimeElapsed',
    duration: 60 * 1000,
    start: 'Step',
  }),
  component: TimeElapsed,
};

export default spec;
