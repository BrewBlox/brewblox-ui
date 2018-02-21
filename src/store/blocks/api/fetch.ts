const host = 'http://localhost:8080/api';

export function get(url: string): Promise<any> {
  return window.fetch(`${host}${url}`).then(response => response.json());
}
