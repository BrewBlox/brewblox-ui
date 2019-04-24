import { RootState } from '@/store/state';
import { ActionContext } from 'vuex';
import { Block, CompatibleBlocks, UnitAlternatives, UserUnits, SystemStatus } from '../state';

export interface SparkState {
  blocks: {
    [id: string]: Block;
  };
  units: UserUnits;
  unitAlternatives: UnitAlternatives;
  compatibleBlocks: CompatibleBlocks;
  discoveredBlocks: string[];
  updateSource: EventSource | null;
  lastStatus: SystemStatus | null;
}

export type BlocksContext = ActionContext<SparkState, RootState>;
