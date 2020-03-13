import { AutomationSpec, TimeAbsoluteImpl } from '../../types';
import TimeAbsolute from './TimeAbsolute.vue';

const spec: AutomationSpec<TimeAbsoluteImpl> = {
  type: 'TimeAbsolute',
  title: 'Date and time',
  generate: () => ({
    type: 'TimeAbsolute',
    time: new Date().getTime(),
  }),
  component: TimeAbsolute,
};

export default spec;
