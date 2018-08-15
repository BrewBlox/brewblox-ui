import { ActionContext } from 'vuex';

import { State as RootState } from '../state';

export interface DataBlock {
  id: string;
  type: string;
  profiles: number[];
  data: Object;
}

export interface Block extends DataBlock {
  serviceId: string;
  isLoading?: boolean;
}

type Value = string | number[];

interface Series {
  name: string; // eslint-disable-line no-restricted-globals
  columns: string[];
  values: Value[];
}

export interface MetricsBase {
  metrics: Series[];
}

export type BlocksState = {
  allIds: string[],
  byId: {
    [id: string]: Block;
  },
  fetching: boolean,
};

export type BlocksContext = ActionContext<BlocksState, RootState>;
