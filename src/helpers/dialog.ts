import get from 'lodash/get';
import { Dialog, DialogChainObject, QDialogOptions } from 'quasar';

import { Block } from '@/plugins/spark/types';

import { deserialize } from './units/parseObject';

export interface DialogOptions extends QDialogOptions {
  [prop: string]: any;
}

export function createDialog(opts: DialogOptions): DialogChainObject {
  return Dialog.create(opts);
}

export function showBlockDialog(block: Block | null, props: any = {}): void {
  if (!block) {
    return;
  }
  createDialog({
    component: 'BlockFormDialog',
    serviceId: block.serviceId,
    blockId: block.id,
    getProps: () => props,
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
