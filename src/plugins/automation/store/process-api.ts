import http, { intercept } from '@/helpers/http';

import { AutomationProcess, AutomationStepJump, AutomationTemplate } from '../types';

export const fetchAll = (): Promise<AutomationProcess[]> =>
  http.get<AutomationProcess[]>('/automation/process/all')
    .then(resp => resp.data)
    .catch(intercept('Failed to fetch processes'));

export const fetch = ({ id, title }): Promise<AutomationProcess> =>
  http.get<AutomationProcess>(`/automation/process/read/${id}`)
    .then(resp => resp.data)
    .catch(intercept(`Failed to fetch process '${title}'`));

export const init = (template: AutomationTemplate): Promise<AutomationProcess> =>
  http.post<AutomationProcess>('/automation/process/init', template)
    .then(resp => resp.data)
    .catch(intercept(`Failed to start process for ${template.title}`));

export const jump = (args: AutomationStepJump): Promise<AutomationProcess> =>
  http.post<AutomationProcess>('/automation/process/jump', args)
    .then(resp => resp.data)
    .catch(intercept('Failed to jump in process'));

export const remove = ({ id, title }): Promise<void> =>
  http.delete(`/automation/process/delete/${id}`)
    .then(() => { })
    .catch(intercept(`Failed to remove process '${title}'`));
