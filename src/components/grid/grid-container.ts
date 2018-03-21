import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class GridContainer extends Vue {
  interaction: boolean = false;

  startInteraction() {
    this.interaction = true;
  }

  stopInteraction() {
    this.interaction = false;
  }
}
