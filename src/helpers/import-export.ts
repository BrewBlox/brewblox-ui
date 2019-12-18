import get from 'lodash/get';
import * as quasar from 'quasar';

import { deserialize, serialize } from './units/parseObject';

// exportFile is missing from the typings, even though it is implemented
// TODO(Bob): replace with correct import once it's fixed in quasar
const exportFile: ((title: string, content: string) => void) = quasar['exportFile'];

export function saveFile(exported: any, title: string, raw = false): void {
  const content = raw ? exported : JSON.stringify(serialize(exported));
  exportFile(title, content);
}

export function loadFile<T>(onSelected: (val: T) => void): void {
  const reader: FileReader = new FileReader();
  const input: HTMLInputElement = document.createElement('input');

  input.setAttribute('type', 'file');
  input.setAttribute('id', 'import-input');

  reader.onload = evt => {
    const str = get(evt, ['target', 'result'], '');
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
};
