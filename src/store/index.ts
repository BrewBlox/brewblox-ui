import Vue from 'vue';
import Vuex from 'vuex';
import features from './features';
import history from './history';
import providers from './providers';
import services from './services';
import { RootState } from './state';

Vue.use(Vuex);

const store = new Vuex.Store<RootState>({
  modules: {
    services,
    providers,
    features,
    history,
  },
  strict: false,
});

export default store;
