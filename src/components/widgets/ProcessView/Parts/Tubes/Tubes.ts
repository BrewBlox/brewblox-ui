import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export class Straight extends Vue {
  render(createElement: Function) {
    return createElement('span', 'Straight');
  }
}

@Component
export class Input extends Vue {
  render(createElement: Function) {
    return createElement('span', 'Input');
  }
}

@Component
export class Output extends Vue {
  render(createElement: Function) {
    return createElement('span', 'Output');
  }
}

@Component
export class Elbow extends Vue {
  render(createElement: Function) {
    return createElement('span', 'Elbow');
  }
}

@Component
export class Tee extends Vue {
  render(createElement: Function) {
    return createElement('span', 'Tee');
  }
}
