import { serialize, deserialize } from '@/helpers/units/parseObject';

const host = process.env.VUE_APP_API_URI;

const toJson = async (result: Promise<Response>) => {
  const response = await result;
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const content = await response.json();
  return content
    ? deserialize(content)
    : content;
};

export const get = async (url: string) =>
  toJson(window.fetch(`${host}${url}`));

export const post = async (url: string, data: any, method = 'POST') =>
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

export const put = async (url: string, data: any) =>
  post(url, data, 'PUT');

export const patch = async (url: string, data: any) =>
  post(url, data, 'PATCH');

export const del = async (url: string, data: any) =>
  post(url, data, 'DELETE');

export const sse = (url: string) =>
  new EventSource(`${host}${url}`);
