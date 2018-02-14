import Vue from 'vue';
import Vuex from 'vuex';

import brews from './modules/brews';
import processgrids from './modules/processgrids';
import menu from './modules/menu';

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
    processgrids,
    menu,
  },
  strict: process.env.NODE_ENV !== 'production',
});
