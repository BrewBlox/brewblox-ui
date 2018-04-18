import Vue from 'vue';
import Vuex from 'vuex';

import { State } from './state';

import blocks from './blocks';
import dashboards from './dashboards';
import settings from './settings';

Vue.use(Vuex);

const store = new Vuex.Store<State>({
  modules: {
    blocks,
    dashboards,
    settings,
  },
});

export default store;
