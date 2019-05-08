import Vue from 'vue';
import Vuex from 'vuex';
import services from './services';
import { RootState } from './state';

Vue.use(Vuex);

const store = new Vuex.Store<RootState>({
  modules: {
    services,
  },
  strict: false,
});

export default store;
