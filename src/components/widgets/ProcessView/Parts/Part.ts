import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable */
@Component({
  props: {
    part: {
      type: Object,
      default: () => { throw new Error('Provide part information'); },
    },
    liquid: {
      type: Number,
      default: null,
    },
    flowing: {
      type: Boolean,
      default: false,
    },
    power: {
      type: Boolean,
      default: false,
    },
  },
})
/* eslint-enable */
export default class Part extends Vue {
  get flipped(): boolean {
    return Boolean(this.$props.part && this.$props.part.flipped);
  }
}
