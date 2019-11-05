import { dashboardStore } from '@/store/dashboards';

import { typeName as graphType } from './Graph/getters';
import { HistoryItem } from './Graph/types';
import { SharedGraphConfig } from './types';

export const sharedWidgetConfigs = (excluded: string[] = []): SharedGraphConfig[] =>
  dashboardStore.widgetValues
    .filter(widget => widget.feature === graphType && !excluded.includes(widget.id))
    .map(widget => {
      const { id, title, config } = widget as HistoryItem;
      return { id, title: `[${dashboardStore.dashboardById(widget.dashboard).title}] ${title}`, config };
    });
