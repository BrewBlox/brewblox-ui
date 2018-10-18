import { ActionContext } from 'vuex';
import { RootState } from '@/store/state';
import { Block, UserUnits, UnitAlternatives } from '../state';

export type SparkState = {
  blocks: {
    [id: string]: Block;
  },
  units: UserUnits;
  unitAlternatives: UnitAlternatives;
  fetching: boolean,
};

export type BlocksContext = ActionContext<SparkState, RootState>;
