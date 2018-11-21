import { Module } from 'vuex';
import { SparkClassState } from './state';
import { RootState, RootStore } from '@/store/state';
import { registerService } from '@/helpers/dynamic-store';
import { Service } from '@/store/services/state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';

const vuexModule = (): Module<SparkClassState, RootState> => ({
  getters,
  mutations,
  actions,
  namespaced: true,
  state: {
    mapped: {},
    listed: [],
  },
});

export const register = async (store: RootStore, service: Service) =>
  registerService(store, `${service.id}-class`, vuexModule());
