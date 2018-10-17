import { ActionContext } from 'vuex';
import { RootState } from '@/store/state';
import { Block, UserUnits } from '../state';

export type SparkState = {
  blocks: {
    [id: string]: Block;
  },
  units: UserUnits;
  fetching: boolean,
};

export type BlocksContext = ActionContext<SparkState, RootState>;
