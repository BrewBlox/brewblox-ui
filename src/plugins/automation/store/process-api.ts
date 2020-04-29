import axios from 'axios';

import { HOST } from '@/helpers/const';
import { intercept } from '@/helpers/http';

import { AutomationProcess, AutomationStepJump, AutomationTemplate } from '../shared-types';

// We don't need the transformers from the default http instance
const http = axios.create({
  baseURL: `${HOST}/automation/process`,
});

export const fetchAll = (): Promise<AutomationProcess[]> =>
  http.get<AutomationProcess[]>('/all')
    .then(resp => resp.data)
    .catch(intercept('Failed to fetch processes'));

export const fetch = ({ id, title }): Promise<AutomationProcess> =>
  http.get<AutomationProcess>(`/read/${id}`)
    .then(resp => resp.data)
    .catch(intercept(`Failed to fetch process '${title}'`));

export const init = (template: AutomationTemplate): Promise<AutomationProcess> =>
  http.post<AutomationProcess>('/init', template)
    .then(resp => resp.data)
    .catch(intercept(`Failed to start process for ${template.title}`));

export const jump = (args: AutomationStepJump): Promise<AutomationProcess> =>
  http.post<AutomationProcess>('/jump', args)
    .then(resp => resp.data)
    .catch(intercept('Failed to jump in process'));

export const remove = ({ id, title }): Promise<void> =>
  http.delete(`/delete/${id}`)
    .then(() => { })
    .catch(intercept(`Failed to remove process '${title}'`));
