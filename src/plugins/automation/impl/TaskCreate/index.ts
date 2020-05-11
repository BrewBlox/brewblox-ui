import { matchesType } from '@/helpers/functional';
import { AutomationSpec, TaskCreateImpl } from '@/plugins/automation/types';

import TaskCreate from './TaskCreate.vue';

const type = 'TaskCreate';
const spec: AutomationSpec<TaskCreateImpl> = {
  type,
  title: 'Create task',
  component: TaskCreate,
  generate: () => ({
    type,
    ref: '',
    title: 'New task',
    message: '',
  }),
  pretty: impl =>
    matchesType<TaskCreateImpl>(type, impl)
      ? `Create new '${impl.title}' task`
      : `Invalid data: type=${impl.type}`,
};

export default spec;
