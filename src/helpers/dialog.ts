import get from 'lodash/get';
import { Dialog, uid } from 'quasar';

import { BlockCrud } from '@/plugins/spark/components/BlockCrudComponent';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import { DashboardItem } from '@/store/dashboards';
import { featureStore } from '@/store/features';

import { deserialize } from './units/parseObject';

export const showBlockDialog = (block: Block | null, props: any = {}) => {
  if (!block) {
    return;
  }
  let widget: DashboardItem = {
    id: uid(),
    title: block.id,
    feature: block.type,
    dashboard: '',
    order: 0,
    config: {
      serviceId: block.serviceId,
      blockId: block.id,
    },
    ...featureStore.widgetSizeById(block.type),
  };
  const wrapper: { dialog: any } = { dialog: null };
  const crud: BlockCrud = {
    widget,
    isStoreWidget: false,
    saveWidget: v => { widget = v; },
    block,
    isStoreBlock: true,
    saveBlock: v => sparkStore.saveBlock([block.serviceId, v]),
    closeDialog: () => wrapper.dialog && wrapper.dialog.hide(),
  };
  wrapper.dialog = Dialog.create({
    component: 'FormDialog',
    getCrud: () => crud,
    getProps: () => props,
  });
};

export function showImportDialog<T>(onSelected: (val: T) => void) {
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
