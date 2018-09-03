import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable indent */
@Component({
  props: {
    cols: {
      type: Number,
      default: 1,
    },
    rows: {
      type: Number,
      default: 1,
    },
    widgetOptions: {
      type: Object,
      default: {}
    },
  },
})
/* eslint-enable */
export default class Widget extends Vue {
  get options() {
    return this.$props.widgetOptions;
  }
}
