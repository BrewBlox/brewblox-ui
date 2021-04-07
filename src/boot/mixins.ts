import { Screen } from 'quasar';

export default ({ Vue }): void => {
  Vue.mixin({
    computed: {
      $dense() {
        return Screen.lt.md;
      },
      $touch() {
        return document.body.classList.contains('touch');
      },
    },
  });
};
