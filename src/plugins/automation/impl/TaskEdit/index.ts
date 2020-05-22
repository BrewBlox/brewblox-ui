import { matchesType } from '@/helpers/functional';
import { AutomationSpec, TaskEditImpl } from '@/plugins/automation/types';

import TaskEdit from './TaskEdit.vue';

const type = 'TaskEdit';
const spec: AutomationSpec<TaskEditImpl> = {
  type,
  title: 'Create or edit task',
  component: TaskEdit,
  generate: () => ({
    type,
    ref: '',
    title: 'New task',
    message: null,
    status: 'Created',
  }),
  pretty: impl =>
    matchesType<TaskEditImpl>(type, impl)
      ? `Edit task with ref '${impl.ref || '<not set>'}'`
      : `Invalid data: type=${impl.type}`,
};

export default spec;
