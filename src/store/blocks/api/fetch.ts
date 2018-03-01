const host = '//localhost:8080/api';

export function get(url: string): Promise<any> {
  return window.fetch(`${host}${url}`).then(response => response.json());
}

export function post(url: string, data: any): Promise<any> {
  return window.fetch(
    `${host}${url}`,
    {
      body: JSON.stringify(data),
      method: 'POST',
    },
  ).then(response => response.json());
}
