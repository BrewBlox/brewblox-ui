const host = '//localhost:8080/api';

function toJson(result: Promise<any>) {
  return result
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response;
    })
    .then(response => response.json());
}

export function get(url: string): Promise<any> {
  return toJson(window.fetch(`${host}${url}`));
}

export function post(url: string, data: any): Promise<any> {
  return toJson(window.fetch(
    `${host}${url}`,
    {
      body: JSON.stringify(data),
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  ));
}
