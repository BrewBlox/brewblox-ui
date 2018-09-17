import Vue from 'vue';
import Vuex from 'vuex';

import { State } from './state';

import dashboards from './dashboards';
import services from './services';

Vue.use(Vuex);

const store = new Vuex.Store<State>({
  modules: {
    dashboards,
    services,
  },
});

export default store;
