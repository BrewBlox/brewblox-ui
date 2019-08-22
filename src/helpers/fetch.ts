import { deserialize, serialize } from '@/helpers/units/parseObject';

interface FetchError {
  time: string;
  info: RequestInfo;
  init?: RequestInit;
  status: number;
  body: string;
}

const host = process.env.VUE_APP_API_URI;
const fetchErrors: FetchError[] = [];

export const getErrors =
  (clear: boolean = false): FetchError[] => {
    const retval = [...fetchErrors];
    if (clear) {
      fetchErrors.length = 0;
    }
    return retval;
  };

const fetch =
  async (info: RequestInfo, init: RequestInit = {}): Promise<Response> =>
    window.fetch(info, { cache: 'no-store', ...init })
      .catch(e => {
        fetchErrors.push({ info, init, time: new Date().toString(), body: e.message, status: -1 });
        throw e;
      });

export const fetchJson =
  async (info: RequestInfo, init?: RequestInit): Promise<any> => {
    const response = await fetch(info, init);

    if (!response.ok) {
      const body = await response.text();
      fetchErrors.push({ info, init, body, time: new Date().toString(), status: response.status });
      throw new Error(body);
    }

    const content = await response.json();
    return content
      ? deserialize(content)
      : content;
  };

export const get =
  async (url: string): Promise<any> => fetchJson(`${host}${url}`);

export const post =
  async (url: string, data: any, method = 'POST'): Promise<any> =>
    fetchJson(
      `${host}${url}`,
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
  (url: string): EventSource => new EventSource(`${host}${url}`);
