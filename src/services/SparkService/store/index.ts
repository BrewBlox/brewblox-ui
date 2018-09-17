import { RootStore } from '@/store/state';
import { Service } from '@/store/services/state';

import actions, { fetchBlocks } from './actions';
import getters, { typeName } from './getters';
import mutations from './mutations';

const vuexModule = {
  actions,
  getters,
  mutations,
  namespaced: true,
  strict: true,
  state: {
    blocks: {},
    fetching: true,
  },
};

export function startup(store: RootStore, service: Service) {
  store.registerModule(typeName, vuexModule);
  fetchBlocks(store, service);
}
