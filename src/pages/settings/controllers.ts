import Vue from 'vue';
import Component from 'vue-class-component';

import { controllers, isFetching } from '@/store/settings/getters';
import { addController, removeController } from '@/store/settings/actions';

@Component
class Controllers extends Vue {
  controllerInput: string = '';
  $q: any;

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

  removeController(controller: string) {
    this.$q.dialog({
      title: 'Remove',
      message: `Do you want to remove controller '${controller}'?`,
      ok: 'Yes',
      cancel: 'Cancel',
    })
      .then(() => removeController(this.$store, controller))
      .catch(() => {});
  }
}

export default Controllers;
