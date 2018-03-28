import Vue from 'vue';
import Component from 'vue-class-component';

import GridItem from './grid-item.vue';

@Component({
  props: {
    onChangeOrder: {
      type: Function,
      default: () => {},
    },
    onChangeSize: {
      type: Function,
      default: () => {},
    },
    onAddBlock: {
      type: Function,
      default: () => {},
    },
  },
  components: { GridItem },
})
export default class GridContainer extends Vue {
  interaction: boolean = false;
  editable: boolean = false;

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

  updateItemSize(id: number, cols: number, rows: number) {
    this.$props.onChangeSize(id, cols, rows);
  }

  toggleEditable() {
    this.editable = !this.editable;
  }

  addBlock() {
    this.$props.onAddBlock();
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
            class: 'grid-container-settings',
          },
          [
            createElement(
              'button',
              {
                class: 'grid-edit-toggle',
                on: {
                  click: this.toggleEditable,
                },
              },
              this.editable ? 'Save changes' : 'Adjust grid',
            ),
            createElement(
              'button',
              {
                class: 'grid-edit-toggle',
                on: {
                  click: this.addBlock,
                },
              },
              'Add block',
            ),
          ],
        ),
        createElement(
          'div',
          {
            class: 'grid-main-container',
          },
          [
            // render the passed children
            ...this.$slots.default
              .filter(slot => slot.tag)
              .map((slot: any) => createElement(
                GridItem,
                {
                  props:
                    { ...slot.data.attrs, editable: this.editable } || { editable: this.editable },
                },
                [slot],
              )),
            // show overlay grid if interaction is happening or in edit mode
            (this.interaction || this.editable) && createElement(
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
            ),
          ],
        ),
      ],
    );
  }
}
