import axios, { AxiosResponse } from 'axios';

import { HOST } from '@/helpers/const';
import { intercept } from '@/helpers/http';

import { SandboxResult, WebhookImpl } from '../types';

// We don't need the transformers from the default http instance
const http = axios.create({
  baseURL: `${HOST}/automation/preview`,
});

export const previewWebhook = (impl: WebhookImpl): Promise<AxiosResponse> =>
  http.post<AxiosResponse>('/webhook', impl)
    .then(resp => resp.data)
    .catch(intercept('Error in webhook preview'));

export const previewSandbox = (args: { body: string }): Promise<SandboxResult> =>
  http.post<SandboxResult>('/sandbox', args)
    .then(resp => resp.data)
    .catch(intercept('Error in sandbox preview'));
