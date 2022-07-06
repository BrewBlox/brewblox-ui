import { nanoid } from 'nanoid';
import { Plugin } from 'vue';

import { startup } from '@/startup';
import { WidgetFeature, useFeatureStore } from '@/store/features';
import { Widget } from '@/store/widgets';
import { cref, globRegister } from '@/utils/component-ref';

import BuilderWidget from './BuilderWidget.vue';
import blueprints from './blueprints';
import { DEFAULT_LAYOUT_HEIGHT, DEFAULT_LAYOUT_WIDTH } from './const';
import { useBuilderStore } from './store';
import { BuilderConfig } from './types';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const builderStore = useBuilderStore();

    const widget: WidgetFeature<BuilderConfig> = {
      id: 'Builder',
      title: 'Brewery Builder',
      component: cref(app, BuilderWidget),
      wizard: true,
      widgetSize: {
        cols: 8,
        rows: 8,
      },
      generateConfig: () => ({
        currentLayoutId: null,
        layoutIds: [],
      }),
      upgrade: (widget) => {
        const config = widget.config as any;

        if (config.parts) {
          const builderStore = useBuilderStore();
          const id = nanoid();
          builderStore.createLayout({
            id,
            title: `${widget.title} layout`,
            width: DEFAULT_LAYOUT_WIDTH,
            height: DEFAULT_LAYOUT_HEIGHT,
            parts: config.parts,
            order: builderStore.layouts.length + 1,
          });

          const layoutIds: string[] = config.layoutIds ?? [];
          layoutIds.push(id);

          const upgraded: Widget<BuilderConfig> = {
            ...widget,
            config: {
              layoutIds,
              currentLayoutId: id,
            },
          };

          return upgraded;
        }

        return null;
      },
    };

    startup.add(builderStore);
    globRegister(app, import.meta.globEager('./components/**/*.vue'));

    builderStore.blueprints = Object.values(blueprints);
    featureStore.addWidgetFeature(widget);
  },
};

export default plugin;
