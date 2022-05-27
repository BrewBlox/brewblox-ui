import get from 'lodash/get';
import { exportFile } from 'quasar';

import { deserialize, serialize } from './parsing';

/**
 * Show browser dialog to save `exported` as UTF-8 file.
 *
 * By default, `exported` is serialized to JSON.
 * Prevent this by setting `raw=true`.
 *
 * @param exported
 * @param title
 * @param raw
 */
export function saveFile(exported: unknown, title: string, raw = false): void {
  const content = raw ? exported : JSON.stringify(serialize(exported));
  exportFile(title, content as string);
}

/**
 * Show browser dialog to load file.
 * This function returns immediately,
 * and `onSelected` is only called if the user confirms the dialog.
 *
 * By default, file contents are deserialized from JSON.
 * Prevent this by setting `raw=true`.
 *
 * @param onSelected
 */
export function loadFile<T>(onSelected: (val: T) => void, raw = false): void {
  const reader: FileReader = new FileReader();
  const input: HTMLInputElement = document.createElement('input');

  input.setAttribute('type', 'file');
  input.setAttribute('id', 'import-input');

  reader.onload = (evt) => {
    const str = get(evt, 'target.result');
    if (str) {
      onSelected(raw ? str : deserialize(JSON.parse(str)));
    }
  };

  input.onchange = (evt) => {
    const file = get(evt, 'target.files[0]');
    if (file) {
      reader.readAsText(file);
    }
  };

  input.click();
}
