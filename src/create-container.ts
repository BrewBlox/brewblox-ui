export default function createContainer(id: string = ''): HTMLElement {
  const documentElement = document.getElementById(id);

  if (documentElement) {
    return documentElement;
  }

  const div = document.createElement('div');
  div.setAttribute('id', id);

  document.body.appendChild(div);

  return div;
}
