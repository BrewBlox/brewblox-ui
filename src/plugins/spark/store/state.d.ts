import { ActionContext } from 'vuex';
import { RootState } from '@/store/state';
import { Block } from '../state';

export type SparkState = {
  blocks: {
    [id: string]: Block;
  },
  fetching: boolean,
};

export type BlocksContext = ActionContext<SparkState, RootState>;
