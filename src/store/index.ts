import Vue from 'vue';
import Vuex from 'vuex';

import { State } from './state';

import blocks from './blocks';

Vue.use(Vuex);

const store = new Vuex.Store<State>({
  modules: {
    blocks,
  },
});

export default store;
