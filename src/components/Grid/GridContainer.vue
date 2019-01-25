<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import GridItem from './GridItem.vue';

@Component({
  props: {
    editable: {
      type: Boolean,
      default: false,
    },
    onChangeOrder: {
      type: Function,
      default: () => { },
    },
    onChangeSize: {
      type: Function,
      default: () => { },
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
      const rectA = a.$el.getBoundingClientRect() as DOMRect;
      const rectB = b.$el.getBoundingClientRect() as DOMRect;

      // check y position
      if (rectA.y !== rectB.y) {
        return rectA.y - rectB.y;
      }

      // check x position
      if (rectA.x !== rectB.x) {
        return rectA.x - rectB.x;
      }

      // is same position
      return 0;
    });

    this.$props.onChangeOrder(sortedChildren);
  }

  updateItemSize(id: string, cols: number, rows: number) {
    this.$props.onChangeSize(id, cols, rows);
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
          [
            // render the passed children
            ...(this.$slots.default || [])
              .filter(slot => slot.tag)
              .map((slot: any) => createElement(
                GridItem,
                {
                  props: {
                    ...slot.data.attrs,
                    ...slot.componentOptions.propsData,
                    editable: this.$props.editable,
                    onStartInteraction: this.startInteraction,
                    onStopInteraction: this.stopInteraction,
                    onUpdateItemSize: this.updateItemSize,
                    onNewItemsOrder: this.newItemsOrder,
                  },
                },
                [slot],
              )),
            // show overlay grid if interaction is happening or in edit mode
            (this.interaction || this.$props.editable) && createElement(
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
</script>

<style scoped>
.grid-container {
  background-color: transparent;
}

.grid-main-container,
.grid-container-overlay {
  position: relative;
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fill, 100px);
  grid-auto-columns: 100px;
  grid-auto-rows: 100px;
  justify-content: center;
}

.grid-container-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  grid-template-rows: auto;
}

.grid-container-overlay-grid {
  background-size: 120px 120px;
  background-image: linear-gradient(#121a1f 20px, transparent 0px),
    linear-gradient(90deg, #121a1f 20px, transparent 0px),
    linear-gradient(#fff, #fff);
  background-position: 0 -20px, -20px, 0 0;
  grid-column-start: 1;
  grid-column-end: -1;
  grid-row-start: 1;
  grid-row-end: 1 span;
  opacity: 0.03;
}
</style>
