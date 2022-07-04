import { Plugin } from 'vue';

import { STATE_TOPIC } from '@/const';
import { eventbus } from '@/eventbus';
import { startup } from '@/startup';
import {
  WatcherFeature,
  WidgetFeature,
  useFeatureStore,
} from '@/store/features';
import { cref } from '@/utils/component-ref';
import { deserialize } from '@/utils/parsing';

import AutomationWatcher from './AutomationWatcher.vue';
import AutomationWidget from './AutomationWidget.vue';
import { useAutomationStore } from './store';
import { AutomationConfig, AutomationEvent } from './types';

const automationTopic = STATE_TOPIC + '/automation';

const plugin: Plugin = {
  install(app) {
    const automationStore = useAutomationStore();
    const featureStore = useFeatureStore();

    const widget: WidgetFeature<AutomationConfig> = {
      id: 'Automation',
      title: 'Automation (Deprecated)',
      component: cref(app, AutomationWidget),
      wizard: true,
      widgetSize: {
        cols: 4,
        rows: 5,
      },
      generateConfig: () => ({}),
    };

    const watcher: WatcherFeature = {
      id: 'AutomationWatcher',
      component: cref(app, AutomationWatcher),
      props: {},
    };

    featureStore.addWidgetFeature(widget);
    featureStore.addWatcherFeature(watcher);

    eventbus.subscribe(automationTopic);
    eventbus.addListener(automationTopic, (_, evt: AutomationEvent) => {
      if (evt.type === 'automation.active') {
        automationStore.setEventData(deserialize(evt.data));
      }
    });

    startup.add(automationStore);
  },
};

export default plugin;
