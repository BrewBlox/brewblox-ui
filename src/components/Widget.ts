import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable indent */
@Component({
  props: {
    config: {
      type: Object,
      default: () => { throw new Error('Provide block config'); },
    },
  },
})
/* eslint-enable */
export default class Widget extends Vue { }
