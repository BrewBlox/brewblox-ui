import Vue from 'vue';
import Vuex from 'vuex';

import { State } from './state';

import blocks from './blocks';
import dashboards from './dashboards';
import services from './services';

Vue.use(Vuex);

const store = new Vuex.Store<State>({
  modules: {
    blocks,
    dashboards,
    services,
  },
});

export default store;
