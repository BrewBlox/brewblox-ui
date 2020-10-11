import { matchesType, shortDateString } from '@/helpers/functional';
import { AutomationSpec, TimeAbsoluteImpl } from '@/plugins/automation/types';

import TimeAbsolute from './TimeAbsolute.vue';

const type = 'TimeAbsolute';
const spec: AutomationSpec<TimeAbsoluteImpl> = {
  type,
  title: 'Date and time',
  component: TimeAbsolute,
  generate: () => ({
    type,
    time: new Date().getTime(),
  }),
  pretty: impl =>
    matchesType<TimeAbsoluteImpl>(type, impl)
      ? `Current date/time must be past ${shortDateString(impl.time)}`
      : `Invalid data: type=${impl.type}`,
};

export default spec;
