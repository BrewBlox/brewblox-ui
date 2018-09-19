import { RootStore } from '@/store/state';
import { Service } from '@/store/services/state';
import { registerService } from '@/helpers/dynamic-store';

const vuexModule = () => ({
  actions: {},
  getters: {},
  mutations: {},
  namespaced: true,
  strict: true,
  state: {
    fetching: true,
  },
});

export const register = (store: RootStore, service: Service) =>
  registerService(store, service.id, vuexModule());
