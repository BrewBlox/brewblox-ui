import { ActionContext } from 'vuex';
import { RootStore, State as RootState } from '@/store/state';
import { Block } from '../state';

export type BlocksState = {
  blocks: {
    [id: string]: Block;
  },
  fetching: boolean,
};

export type BlocksContext = ActionContext<BlocksState, RootState>;
