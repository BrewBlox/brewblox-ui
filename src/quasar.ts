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
  QBtnGroup,
  QIcon,
  QList,
  QListHeader,
  QItem,
  QItemMain,
  QItemSide,
  QItemTile,
  QItemSeparator,
  QModal,
  QModalLayout,
  QInnerLoading,
  QSpinner,
  QCard,
  QCardTitle,
  QCardSeparator,
  QCardMain,
  QInput,
  QSelect,
  Ripple,
  Notify,
} from 'quasar';

import 'quasar-extras/roboto-font';
import 'quasar-extras/material-icons';
import 'quasar-extras/mdi';
import 'quasar-extras/animate/bounceInLeft.css';
import 'quasar-extras/animate/bounceOutRight.css';
import 'quasar-app-styl';

import './css/app.styl';

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
    QBtnGroup,
    QIcon,
    QList,
    QListHeader,
    QItem,
    QItemMain,
    QItemSide,
    QItemTile,
    QItemSeparator,
    QModal,
    QModalLayout,
    QInnerLoading,
    QSpinner,
    QCard,
    QCardTitle,
    QCardSeparator,
    QCardMain,
    QInput,
    QSelect,
  },
  directives: { Ripple },
  plugins: { Notify },
});
