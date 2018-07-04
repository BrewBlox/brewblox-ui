import Vue from 'vue';
import Component from 'vue-class-component';

import componentByType from './Parts';

/* eslint-disable */
@Component({
  props: {
    part: {
      type: [Object],
      default: () => { throw new Error('Provide part information'); },
    },
  },
})
/* eslint-enable */
export default class ProcessViewItem extends Vue {
  get partType(): ProcessViewPartType {
    return this.$props.part.type as ProcessViewPartType;
  }

  get component() {
    return componentByType(this.partType);
  }
}
