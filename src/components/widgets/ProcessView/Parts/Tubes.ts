import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export class Straight extends Vue {
  render(createElement: Function) {
    return createElement('span', 'test');
  }
}
