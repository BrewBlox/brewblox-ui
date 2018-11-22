import Vue from 'vue';
import Vuex from 'vuex';
import dashboards from './dashboards';
import features from './features';
import history from './history';
import providers from './providers';
import services from './services';
import { RootState } from './state';

Vue.use(Vuex);

const store = new Vuex.Store<RootState>({
  modules: {
    dashboards,
    services,
    providers,
    features,
    history,
  },
  strict: false,
});

export default store;
