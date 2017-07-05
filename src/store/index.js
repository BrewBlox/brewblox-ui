import Vue from 'vue';
import Vuex from 'vuex';

import charts from './modules/charts';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    test: 'test',
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    charts,
  },
  strict: process.env.NODE_ENV !== 'production',
});
