import { serialize, deserialize } from '@/helpers/units/parseObject';

const host = process.env.VUE_APP_API_URI;

function toJson(result: Promise<Response>): Promise<any> {
  return result
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response;
    })
    .then(response => response.json())
    .then(data => deserialize(data));
}

export function get(url: string): Promise<any> {
  return toJson(window.fetch(`${host}${url}`));
}

export function post(url: string, data: any, method = 'POST'): Promise<any> {
  return toJson(window.fetch(
    `${host}${url}`,
    {
      method,
      body: JSON.stringify(serialize(data)),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  ));
}

export function put(url: string, data: any): Promise<any> {
  return post(url, data, 'PUT');
}

export function patch(url: string, data: any): Promise<any> {
  return post(url, data, 'PATCH');
}

export function del(url: string, data: any): Promise<any> {
  return post(url, data, 'DELETE');
}
