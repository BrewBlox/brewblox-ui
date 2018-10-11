import { ActionContext } from 'vuex';
import { RootState } from '@/store/state';
import { Metric } from '@/plugins/history/state';

export type HistoryState = {
  availableFields: {
    [measurement: string]: string[];
  };
  metrics: {
    [id: string]: Metric;
  };
};

export type HistoryContext = ActionContext<HistoryState, RootState>;
