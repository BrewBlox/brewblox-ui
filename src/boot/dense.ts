import { Screen } from 'quasar';

const denseMixin = {
  computed: {
    $dense() {
      return Screen.lt.md;
    },
  },
};

export default ({ Vue }): void => {
  Vue.mixin(denseMixin);
};
