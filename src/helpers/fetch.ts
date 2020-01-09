import { HOST } from '@/helpers/const';
import { deserialize, serialize } from '@/helpers/units/parseObject';

import notify from '../plugins/logging/notify';

const fetch =
  async (info: RequestInfo, init: RequestInit = {}): Promise<Response> =>
    window.fetch(info, { cache: 'no-store', ...init })
      .catch(e => {
        notify.error(`Failed to fetch '${info}': ${e.message}`, { silent: true });
        throw e;
      });

export const fetchJson =
  async (info: RequestInfo, init?: RequestInit): Promise<any> => {
    const response = await fetch(info, init);

    if (!response.ok || response.status >= 400) {
      const body = await response.text();
      notify.error(`Fetch error response: '${info}' (${response.status}) ---- ${body}`, { silent: true });
      throw new Error(body);
    }

    const content = await response.json();
    return content
      ? deserialize(content)
      : content;
  };

export const get =
  async (url: string): Promise<any> => fetchJson(`${HOST}${url}`);

export const post =
  async (url: string, data: any, method = 'POST'): Promise<any> =>
    fetchJson(
      `${HOST}${url}`,
      {
        method,
        body: JSON.stringify(serialize(data)),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      },
    );

export const put =
  async (url: string, data: any): Promise<any> => post(url, data, 'PUT');

export const patch =
  async (url: string, data: any): Promise<any> => post(url, data, 'PATCH');

export const del =
  async (url: string, data: any): Promise<any> => post(url, data, 'DELETE');

export const sse =
  (url: string): EventSource => new EventSource(`${HOST}${url}`);
