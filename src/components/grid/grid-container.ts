import Vue from 'vue';
import Component from 'vue-class-component';

import GridItem from './grid-item.vue';

@Component({
  props: {
    onChangeOrder: {
      type: Function,
      default: () => {},
    },
  },
  components: { GridItem },
})
export default class GridContainer extends Vue {
  interaction: boolean = false;

  startInteraction() {
    this.interaction = true;
  }

  stopInteraction() {
    this.interaction = false;
  }

  newItemsOrder() {
    const sortedChildren = [...this.$children].sort((a, b) => {
      const rectA = <DOMRect>a.$el.getBoundingClientRect();
      const rectB = <DOMRect>b.$el.getBoundingClientRect();

      // check y position
      if (rectA.y < rectB.y) {
        return -1;
      }

      if (rectA.y > rectB.y) {
        return 1;
      }

      // check x position
      if (rectA.x < rectB.x) {
        return -1;
      }

      if (rectA.x > rectB.x) {
        return 1;
      }

      // is same position
      return 0;
    });

    this.$props.onChangeOrder(sortedChildren);
  }

  render(createElement: Function) {
    return createElement(
      'div',
      {
        class: 'grid-container',
      },
      [
        createElement(
          'div',
          {
            class: 'grid-main-container',
          },
          this.$slots.default
            .filter(slot => slot.tag)
            .map((slot: any) => createElement(
              GridItem,
              {
                props: slot.data.attrs || {},
              },
              [slot],
            )),
        ),
        this.interaction ? createElement(
          'div',
          {
            class: 'grid-container-overlay',
          },
          [
            createElement(
              'div',
              {
                class: 'grid-container-overlay-grid',
              },
            ),
          ],
        ) : null,
      ],
    );
  }
}
