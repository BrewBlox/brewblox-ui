import { matchesType, shortDateString } from '@/helpers/functional';

import { AutomationSpec, TimeAbsoluteImpl } from '../../types';
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
      ? `Wait until ${shortDateString(impl.time)}`
      : `Invalid data: type=${impl.type}`,
};

export default spec;
