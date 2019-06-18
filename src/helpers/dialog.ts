import { Dialog, uid } from 'quasar';
import Vue from 'vue';

import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import { DashboardItem } from '@/store/dashboards';
import featureStore from '@/store/features';

export const showBlockDialog = (block: Block, root: Vue) => {
  const widget: DashboardItem = {
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
  Dialog.create({
    component: 'BlockFormDialog',
    volatile: true,
    root,
    getBlock: () => block,
    saveBlock: v => sparkStore.saveBlock([block.serviceId, v]),
    getWidget: () => widget,
    saveWidget: () => { },
  });
};
