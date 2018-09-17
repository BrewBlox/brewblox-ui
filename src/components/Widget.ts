import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable indent */
@Component({
  props: {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
    onConfigChange: {
      type: Function,
      default: (id: string, config: Object) => { },
    },
  },
})
/* eslint-enable */
export default class Widget extends Vue { }
