import { AutomationSpec, TaskCreateImpl } from '../../types';
import TaskCreate from './TaskCreate.vue';

const spec: AutomationSpec<TaskCreateImpl> = {
  type: 'TaskCreate',
  title: 'Create task',
  generate: () => ({
    type: 'TaskCreate',
    ref: '',
    title: 'New task',
    message: '',
  }),
  component: TaskCreate,
};

export default spec;
