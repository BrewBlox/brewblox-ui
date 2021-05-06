import get from 'lodash/get';
import { exportFile } from 'quasar';

import { deserialize } from '@/utils/parse-object';

export function saveFile(exported: unknown, title: string, raw = false): void {
  const content = raw ? exported : JSON.stringify(exported);
  exportFile(title, content as string);
}

export function loadFile<T>(onSelected: (val: T) => void): void {
  const reader: FileReader = new FileReader();
  const input: HTMLInputElement = document.createElement('input');

  input.setAttribute('type', 'file');
  input.setAttribute('id', 'import-input');

  reader.onload = evt => {
    const str = get(evt, ['target', 'result']);
    if (str) {
      onSelected(deserialize(JSON.parse(str)));
    }
  };

  input.onchange = evt => {
    const file = get(evt, ['target', 'files', 0]);
    if (file) {
      reader.readAsText(file);
    }
  };

  input.click();
}
