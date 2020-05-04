import axios from 'axios';

import { HOST } from '@/helpers/const';
import { intercept } from '@/helpers/http';

import { AutomationTask } from '../shared-types';

// We don't need the transformers from the default http instance
const http = axios.create({
  baseURL: `${HOST}/automation/task`,
});

export const fetchAll = (): Promise<AutomationTask[]> =>
  http.get<AutomationTask[]>('/all')
    .then(resp => resp.data)
    .catch(intercept('Failed to fetch tasks'));

export const fetch = ({ id, title }): Promise<AutomationTask> =>
  http.get<AutomationTask>(`/read/${id}`)
    .then(resp => resp.data)
    .catch(intercept(`Failed to fetch task '${title}'`));

export const create = (task: AutomationTask): Promise<AutomationTask> =>
  http.post<AutomationTask>('/create', task)
    .then(resp => resp.data)
    .catch(intercept(`Failed to create ${task.title}`));

export const persist = (task: AutomationTask): Promise<AutomationTask> =>
  http.post<AutomationTask>('/update', task)
    .then(resp => resp.data)
    .catch(intercept(`Failed to update ${task.title}`));

export const remove = ({ id, title }): Promise<void> =>
  http.delete(`/delete/${id}`)
    .then(() => { })
    .catch(intercept(`Failed to remove task '${title}'`));
