import { AxiosResponse } from 'axios';

import { http, intercept } from '@/utils/http';

import { SandboxResult, WebhookImpl } from '../types';

export const previewWebhook = (impl: WebhookImpl): Promise<AxiosResponse> =>
  http
    .post<WebhookImpl, AxiosResponse<AxiosResponse>>(
      '/automation/preview/webhook',
      impl,
    )
    .then((resp) => resp.data)
    .catch(intercept('Error in webhook preview'));

export const previewSandbox = (args: {
  body: string;
}): Promise<SandboxResult> =>
  http
    .post<{ body: string }, AxiosResponse<SandboxResult>>(
      '/automation/preview/sandbox',
      args,
    )
    .then((resp) => resp.data)
    .catch(intercept('Error in sandbox preview'));
