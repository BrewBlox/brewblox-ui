import Vue from 'vue';
import Vuex from 'vuex';

import brews from './modules/brews';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    brews,
  },
  strict: process.env.NODE_ENV !== 'production',
});
