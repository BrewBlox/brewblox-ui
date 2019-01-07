import Vue from 'vue';
import Component from 'vue-class-component';
import {FlowPart} from '../state';

@Component({
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
})
export default class PartComponent extends Vue {
  get part(): FlowPart {
    return this.$props.value;
  }

  savePart(part: FlowPart = this.part) {
    this.$parent.$emit('input', {...part});
  }

  removePart() {
    this.$parent.$emit('remove', this.part);
  }
}
