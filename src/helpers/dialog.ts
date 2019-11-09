import get from 'lodash/get';
import { Dialog, DialogChainObject, QDialogOptions } from 'quasar';

import { Block } from '@/plugins/spark/types';
import { WidgetMode } from '@/store/features';

import { deserialize } from './units/parseObject';

export function createDialog(opts: QDialogOptions & { [prop: string]: any }): DialogChainObject {
  return Dialog.create(opts);
}

export function showBlockDialog(block: Block | null, opts: { props?: any; mode?: WidgetMode } = {}): void {
  if (!block) {
    return;
  }
  const { props, mode } = opts;
  createDialog({
    component: 'BlockWidgetDialog',
    serviceId: block.serviceId,
    blockId: block.id,
    mode,
    getProps: () => props || {},
  });
};

export function showImportDialog<T>(onSelected: (val: T) => void): void {
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
