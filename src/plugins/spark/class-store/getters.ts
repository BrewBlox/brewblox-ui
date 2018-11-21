import { GetterTree } from 'vuex';
import { SparkClassState } from './state';
import { RootState } from '@/store/state';

export const getters: GetterTree<SparkClassState, RootState> = {
  mappedValues: (state: SparkClassState) => Object.values(state.mapped),
};
