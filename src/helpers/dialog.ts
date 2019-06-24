import { Dialog, uid } from 'quasar';
import Vue from 'vue';

import { BlockCrud } from '@/plugins/spark/components/BlockCrudComponent';
import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import { DashboardItem } from '@/store/dashboards';
import featureStore from '@/store/features';

export const showBlockDialog = (block: Block, root: Vue, props: any = {}) => {
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
  const crud: BlockCrud = {
    widget,
    isStoreWidget: false,
    saveWidget: v => { widget = v; },
    block,
    isStoreBlock: true,
    saveBlock: v => sparkStore.saveBlock([block.serviceId, v]),
  };
  Dialog.create({
    component: 'FormDialog',
    root,
    getCrud: () => crud,
    getProps: () => props,
  });
};
