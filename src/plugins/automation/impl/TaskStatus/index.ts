import { AutomationSpec, TaskStatusImpl } from '../../types';
import TaskStatus from './TaskStatus.vue';

const spec: AutomationSpec<TaskStatusImpl> = {
  type: 'TaskStatus',
  title: 'Task status',
  generate: () => ({
    type: 'TaskStatus',
    ref: '',
    status: 'Finished',
  }),
  component: TaskStatus,
};

export default spec;
