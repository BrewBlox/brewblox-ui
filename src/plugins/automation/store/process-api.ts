import { http, intercept } from '@/utils/http';
import { AxiosResponse } from 'axios';
import {
  AutomationProcess,
  AutomationStepJump,
  AutomationTemplate,
} from '../types';

export const fetchAll = (): Promise<AutomationProcess[]> =>
  http
    .get<AutomationProcess[]>('/automation/process/all')
    .then((resp) => resp.data)
    .catch(intercept('Failed to fetch processes'));

export const fetch = ({
  id,
  title,
}: {
  id: string;
  title: string;
}): Promise<AutomationProcess> =>
  http
    .get<AutomationProcess>(`/automation/process/read/${id}`)
    .then((resp) => resp.data)
    .catch(intercept(`Failed to fetch process '${title}'`));

export const init = (
  template: AutomationTemplate,
): Promise<AutomationProcess> =>
  http
    .post<AutomationTemplate, AxiosResponse<AutomationProcess>>(
      '/automation/process/init',
      template,
    )
    .then((resp) => resp.data)
    .catch(intercept(`Failed to start process for ${template.title}`));

export const jump = (args: AutomationStepJump): Promise<AutomationProcess> =>
  http
    .post<AutomationStepJump, AxiosResponse<AutomationProcess>>(
      '/automation/process/jump',
      args,
    )
    .then((resp) => resp.data)
    .catch(intercept('Failed to jump in process'));

export const remove = ({
  id,
  title,
}: {
  id: string;
  title: string;
}): Promise<void> =>
  http
    .delete(`/automation/process/delete/${id}`)
    .then(() => {})
    .catch(intercept(`Failed to remove process '${title}'`));
