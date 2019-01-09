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
export default class PartCard extends Vue {
  get part(): FlowPart {
    return this.$props.value;
  }

  savePart(part: FlowPart = this.part) {
    this.$emit('input', {...part});
  }

  removePart() {
    this.$emit('remove', this.part);
  }
}
