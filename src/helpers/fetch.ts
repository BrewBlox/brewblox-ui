import { deserialize, serialize } from '@/helpers/units/parseObject';

const host = process.env.VUE_APP_API_URI;

export const toJson =
  async (result: Promise<Response>): Promise<any> => {
    const response = await result;
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const content = await response.json();
    return content
      ? deserialize(content)
      : content;
  };

export const get =
  async (url: string): Promise<any> => toJson(window.fetch(`${host}${url}`));

export const post =
  async (url: string, data: any, method = 'POST'): Promise<any> =>
    toJson(window.fetch(
      `${host}${url}`,
      {
        method,
        body: JSON.stringify(serialize(data)),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      },
    ));

export const put =
  async (url: string, data: any): Promise<any> => post(url, data, 'PUT');

export const patch =
  async (url: string, data: any): Promise<any> => post(url, data, 'PATCH');

export const del =
  async (url: string, data: any): Promise<any> => post(url, data, 'DELETE');

export const sse =
  (url: string): EventSource => new EventSource(`${host}${url}`);
