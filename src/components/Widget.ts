import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable indent */
@Component({
  props: {
    id: {
      type: String,
      default: () => { throw new Error('Provie item ID'); },
    },
    config: {
      type: Object,
      default: () => { throw new Error('Provide block config'); },
    },
    onConfigChange: {
      type: Function,
      default: (id: string, config: Object) => { },
    },
  },
})
/* eslint-enable */
export default class Widget extends Vue { }
