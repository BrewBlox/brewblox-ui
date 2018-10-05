import { ActionContext } from 'vuex';
import { RootState } from '@/store/state';
import { Metric } from '@/plugins/history/state';

export type HistoryState = {
  availableKeys: string[];
  metrics: {
    [id: string]: Metric;
  };
};

export type HistoryContext = ActionContext<HistoryState, RootState>;
