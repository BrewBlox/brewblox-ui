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
    power: {
      type: Boolean,
      default: false,
    },
  },
})
/* eslint-enable */
export default class Part extends Vue {
  get partData(): ProcessViewPart {
    return this.$props.part;
  }

  partRender = (createElement: Function): Vue => {
    throw new Error('Overwrite partRender method');
  }

  render(createElement: Function) {
    return createElement(
      'div',
      {
        style: {
          transform: `rotate(${this.partData.rotate}deg)`,
        },
      },
      [this.partRender(createElement)],
    );
  }
}
