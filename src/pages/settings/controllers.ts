import Vue from 'vue';
import Component from 'vue-class-component';

import { controllers, isFetching } from '@/store/settings/getters';

@Component
class Controllers extends Vue {
  controllerInput: string = '';

  get isFetching() {
    return isFetching(this.$store);
  }

  get controllers() {
    return controllers(this.$store);
  }
}

export default Controllers;
