import Vue from 'vue';
import store from '@/store';
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators';
// import { registerService } from '@/helpers/dynamic-store';
// import { Service } from '@/store/services/state';
// import { RootStore } from '@/store/state';
// import { Module } from 'vuex';
// import { actions } from './actions';
// import { getters } from './getters';
// import { mutations } from './mutations';
// import { SparkState } from './state';

// const module: Module<SparkState, {}> = {
//   actions,
//   getters,
//   mutations,
//   namespaced: true,
//   state: () => ({
//     blocks: {},
//     units: {},
//     unitAlternatives: {},
//     compatibleBlocks: {},
//     discoveredBlocks: [],
//     updateSource: null,
//     lastStatus: null,
//   }),
// };

// export const register =
//   async (store: RootStore, service: Service): Promise<void> =>
//     registerService(store, service.id, module);

@Module({ store, namespaced: true, dynamic: true, name: 'spark' })
export class SparkModule extends VuexModule {

}

export default getModule(SparkModule);
