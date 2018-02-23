import Vue from 'vue';
import Quasar, {
  QLayout,
  QLayoutHeader,
  QLayoutDrawer,
  QPageContainer,
  QPage,
  QToolbar,
  QToolbarTitle,
  QBtn,
  QIcon,
  QList,
  QListHeader,
  QItem,
  QItemMain,
  QItemSide,
  QModal,
  QModalLayout,
  QInnerLoading,
  QField,
  QSlider,
  QSpinner,
  QCard,
  QCardTitle,
  QCardSeparator,
  QCardMain,
  Ripple,
  Notify,
} from 'quasar';

import 'quasar-extras/roboto-font';
import 'quasar-extras/material-icons';
import 'quasar-extras/animate/bounceInLeft.css';
import 'quasar-extras/animate/bounceOutRight.css';
import 'quasar-app-styl';

import './css/app.styl';

import router from './router';
import store from './store';

import pluginI18n from './plugins/i18n';

import App from './App.vue';

Vue.use(Quasar, {
  components: {
    QLayout,
    QLayoutHeader,
    QLayoutDrawer,
    QPageContainer,
    QPage,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QIcon,
    QList,
    QListHeader,
    QItem,
    QItemMain,
    QItemSide,
    QModal,
    QModalLayout,
    QInnerLoading,
    QField,
    QSlider,
    QSpinner,
    QCard,
    QCardTitle,
    QCardSeparator,
    QCardMain,
  },
  directives: { Ripple },
  plugins: { Notify },
});

const app = new Vue({
  el: '#q-app',
  router,
  store,
  render: h => h(App),
});

const plugins = [];

plugins.push(pluginI18n);

plugins.forEach(plugin => plugin({ app, router, store, Vue }));
