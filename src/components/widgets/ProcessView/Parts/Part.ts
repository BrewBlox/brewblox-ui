import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable */
@Component({
  props: {
    part: {
      type: Object,
      default: () => { throw new Error('Provide part information'); },
    },
  },
})
/* eslint-enable */
export default class Part extends Vue {
  partRender = (createElement: Function): Vue => {
    throw new Error('Overwrite partRender method');
  }

  render(createElement: Function) {
    const part = this.$props.part as ProcessViewPart;

    return createElement(
      'div',
      {
        style: {
          transform: `rotate(${part.rotate}deg)`,
        },
      },
      [this.partRender(createElement)],
    );
  }
}
