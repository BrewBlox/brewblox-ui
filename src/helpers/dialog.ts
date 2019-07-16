import { Dialog, uid } from 'quasar';

import { BlockCrud } from '@/plugins/spark/components/BlockCrudComponent';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import { DashboardItem } from '@/store/dashboards';
import { featureStore } from '@/store/features';

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
