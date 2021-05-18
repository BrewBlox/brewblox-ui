import http, { intercept } from '@/utils/http';

import { AutomationTask } from '../types';

export const fetchAll = (): Promise<AutomationTask[]> =>
  http.get<AutomationTask[]>('/automation/task/all')
    .then(resp => resp.data)
    .catch(intercept('Failed to fetch tasks'));

export const fetch = ({ id, title }: { id: string, title: string }): Promise<AutomationTask> =>
  http.get<AutomationTask>(`/automation/task/read/${id}`)
    .then(resp => resp.data)
    .catch(intercept(`Failed to fetch task '${title}'`));

export const create = (task: AutomationTask): Promise<AutomationTask> =>
  http.post<AutomationTask>('/automation/task/create', task)
    .then(resp => resp.data)
    .catch(intercept(`Failed to create ${task.title}`));

export const persist = (task: AutomationTask): Promise<AutomationTask> =>
  http.post<AutomationTask>('/automation/task/update', task)
    .then(resp => resp.data)
    .catch(intercept(`Failed to update ${task.title}`));

export const remove = ({ id, title }: { id: string, title: string }): Promise<void> =>
  http.delete(`/automation/task/delete/${id}`)
    .then(() => { })
    .catch(intercept(`Failed to remove task '${title}'`));
