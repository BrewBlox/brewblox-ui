import { registerService } from '@/helpers/dynamic-store';
import { Service } from '@/store/services/state';
import { RootStore } from '@/store/state';
import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';

const module = {
  actions,
  getters,
  mutations,
  namespaced: true,
  strict: true,
  state: () => ({
    blocks: {},
    units: {},
    unitAlternatives: {},
    compatibleBlocks: {},
    discoveredBlocks: [],
  }),
};

export const register = async (store: RootStore, service: Service) =>
  registerService(store, service.id, module);
