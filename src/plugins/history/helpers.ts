import { dashboardStore, Widget } from '@/store/dashboards';

import { typeName as graphType } from './Graph/getters';
import { GraphConfig, SharedGraphConfig } from './types';

export const sharedWidgetConfigs = (excluded: string[] = []): SharedGraphConfig[] =>
  dashboardStore.widgetValues
    .filter(widget => widget.feature === graphType && !excluded.includes(widget.id))
    .map((widget: Widget<GraphConfig>) => {
      const { id, title, config } = widget;
      return { id, title: `[${dashboardStore.dashboardById(widget.dashboard).title}] ${title}`, config };
    });
