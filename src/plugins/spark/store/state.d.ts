import { ActionContext } from 'vuex';
import { RootState } from '@/store/state';
import { Block, UserUnits, UnitAlternatives, CompatibleBlocks } from '../state';

export type SparkState = {
  blocks: {
    [id: string]: Block;
  },
  units: UserUnits;
  unitAlternatives: UnitAlternatives;
  compatibleBlocks: CompatibleBlocks;
  discoveredBlocks: string[];
  fetching: boolean,
};

export type BlocksContext = ActionContext<SparkState, RootState>;
