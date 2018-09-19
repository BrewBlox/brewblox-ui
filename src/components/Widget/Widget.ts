import Vue from 'vue';
import Component from 'vue-class-component';

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
export default class Widget extends Vue { }
