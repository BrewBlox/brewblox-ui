import Vue from 'vue';
import Component from 'vue-class-component';

import { controllers, isFetching } from '@/store/settings/getters';
import { addController } from '@/store/settings/actions';

@Component
class Controllers extends Vue {
  controllerInput: string = '';

  get isFetching() {
    return isFetching(this.$store);
  }

  get controllers() {
    return controllers(this.$store);
  }

  addController() {
    addController(this.$store, this.controllerInput);

    // reset input
    this.controllerInput = '';
  }
}

export default Controllers;
