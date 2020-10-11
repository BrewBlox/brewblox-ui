import { durationString } from '@/helpers/duration';
import { matchesType } from '@/helpers/functional';
import { AutomationSpec, TimeElapsedImpl } from '@/plugins/automation/types';

import TimeElapsed from './TimeElapsed.vue';

const type = 'TimeElapsed';
const spec: AutomationSpec<TimeElapsedImpl> = {
  type,
  title: 'Duration',
  component: TimeElapsed,
  generate: () => ({
    type,
    duration: 60 * 1000,
    start: 'Step',
  }),
  pretty: impl =>
    matchesType<TimeElapsedImpl>(type, impl)
      ? `Step must have been active for ${durationString(impl.duration)}`
      : `Invalid data: type=${impl.type}`,
};

export default spec;
