import Vue from 'vue';
import Vuex from 'vuex';
import history from './history';
import providers from './providers';
import services from './services';
import { RootState } from './state';

Vue.use(Vuex);

const store = new Vuex.Store<RootState>({
  modules: {
    services,
    providers,
    history,
  },
  strict: false,
});

export default store;
