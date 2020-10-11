import { dashboardStore, Widget } from '@/store/dashboards';

import { typeName as graphType } from './Graph/getters';
import { GraphConfig, SharedGraphConfig } from './types';

export const sharedWidgetConfigs = (excluded: string[] = []): SharedGraphConfig[] =>
  dashboardStore.widgets
    .filter(widget => widget.feature === graphType && !excluded.includes(widget.id))
    .map((widget: Widget<GraphConfig>) => {
      const { id, title, config, dashboard } = widget;
      return { id, title: `[${dashboardStore.dashboardTitle(dashboard)}] ${title}`, config };
    });
