import { Plugin } from 'vue';

import { STATE_TOPIC } from '@/const';
import { eventbus } from '@/eventbus';
import { featureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';

import BrewfatherWidget from './BrewfatherWidget.vue';
import { BREWFATHER_ID } from './const';
import { brewfatherStore } from './store';
import { BrewfatherWidgetConfig } from './types';
import { isBrewfatherState } from './utils';

const plugin: Plugin = {
  install(app) {

    const widget: WidgetFeature<BrewfatherWidgetConfig> = {
      id: 'Brewfather',
      title: 'Brewfather',
      component: cref(app, BrewfatherWidget),
      wizard: true,
      widgetSize: {
        cols: 4,
        rows: 4,
      },
      generateConfig: () => ({}),
    };

    featureStore.addWidgetFeature(widget);

    eventbus.subscribe(`${STATE_TOPIC}/${BREWFATHER_ID}`);
    eventbus.addListener(`${STATE_TOPIC}/${BREWFATHER_ID}`, (_, data) => {
      if (isBrewfatherState(data)) {
        brewfatherStore.state = data.data.state ?? null;
        brewfatherStore.messages = [...brewfatherStore.messages, data.data.status_msg];
      }
    });
  },
};

export default plugin;
