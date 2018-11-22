import { RootState } from '@/store/state';
import { ActionContext } from 'vuex';
import { Block, CompatibleBlocks, UnitAlternatives, UserUnits } from '../state';

export type SparkState = {
  blocks: {
    [id: string]: Block;
  };
  units: UserUnits;
  unitAlternatives: UnitAlternatives;
  compatibleBlocks: CompatibleBlocks;
  discoveredBlocks: string[];
};

export type BlocksContext = ActionContext<SparkState, RootState>;
