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
      default: () => (id: string, config: Object) => { },
    },
    cols: {
      type: Number,
      required: true,
    },
    rows: {
      type: Number,
      required: true,
    },
  },
})
export default class Widget extends Vue {
  get additionalInfo() {
    return {
      'Widget ID': this.$props.id,
      'Feature type': this.$props.type,
    };
  }
}
