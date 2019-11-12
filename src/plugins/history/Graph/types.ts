import { GraphConfig } from '@/plugins/history/types';
import { PersistentWidget } from '@/store/dashboards';

export type HistoryItem = PersistentWidget<GraphConfig>;
