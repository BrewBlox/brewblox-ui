import { durationString, matchesType } from '@/helpers/functional';

import { AutomationSpec, TimeElapsedImpl } from '../../types';
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
      ? `Wait until ${durationString(impl.duration)} has elapsed`
      : `Invalid data: type=${impl.type}`,
};

export default spec;
