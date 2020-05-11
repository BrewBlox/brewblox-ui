import { matchesType } from '@/helpers/functional';
import { AutomationSpec, TaskStatusImpl } from '@/plugins/automation/types';

import TaskStatus from './TaskStatus.vue';

const type = 'TaskStatus';
const spec: AutomationSpec<TaskStatusImpl> = {
  type,
  title: 'Task status',
  component: TaskStatus,
  generate: () => ({
    type,
    ref: '',
    status: 'Finished',
  }),
  pretty: impl =>
    matchesType<TaskStatusImpl>(type, impl)
      ? `Assert that task status is ${impl.status}`
      : `Invalid data: type=${impl.type}`,
};

export default spec;
