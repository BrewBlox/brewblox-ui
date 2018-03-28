import Vue from 'vue';
import Vuex from 'vuex';

import { State } from './state';

import blocks from './blocks';
import dashboards from './dashboards';

Vue.use(Vuex);

const store = new Vuex.Store<State>({
  modules: {
    blocks,
    dashboards,
  },
});

export default store;
