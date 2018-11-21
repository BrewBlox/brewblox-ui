import { ActionTree, Action } from 'vuex';
import { SparkClassState, SparkClassContext } from './state';
import { RootState, RootStore } from '@/store/state';
import { dispatch } from '@/helpers/dynamic-store';

export const actions: ActionTree<SparkClassState, RootState> = {
  addMapped: async ({ commit }, { key, val }) =>
    commit('addMapped', { key, val }),
};

// const dispatch = (action: Action<SparkClassState, RootState>) =>
//   (store: RootStore, serviceId: string, payload: any) =>
//     store.dispatch(`${serviceId}-class/${(action as Function).name}`, payload);

export const addMapped = dispatch(actions.addMapped);
