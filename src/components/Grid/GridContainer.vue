<script lang="ts">
import Vue, { CreateElement, VNode, VNodeComponentOptions } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import GridItem from './GridItem.vue';

@Component({
  components: { GridItem },
})
export default class GridContainer extends Vue {
  activeItemId: string | null = null;
  activeItemPos: XYPosition | null = null;

  @Prop({ type: Boolean, default: false })
  readonly editable!: boolean;

  get gridItems(): GridItem[] {
    return this.$children as GridItem[];
  }

  startInteraction(id: string) {
    this.activeItemId = id;
  }

  stopInteraction() {
    this.activeItemId = null;
    this.activeItemPos = null;
  }

  moveInteraction(id: string, pos: XYPosition) {
    this.activeItemPos = pos;
  }

  updateItemPosition(id: string, pos: XYPosition | null) {
    const newItemsOrder = this.gridItems
      .map(item => [item, item.$el.getBoundingClientRect()] as [GridItem, DOMRect])
      .sort(([, rectA], [, rectB]) => (rectA.y - rectB.y) || (rectA.x - rectB.x))
      .map(([item]) => item.id);
    this.$emit('change-positions', id, pos, newItemsOrder);
  }

  updateItemSize(id: string, cols: number, rows: number) {
    this.$emit('change-size', id, cols, rows);
  }

  slotStyle(slot: VNode) {
    const style: Record<string, string> = {};
    const opts = slot.componentOptions as VNodeComponentOptions;
    const { id, pinnedPosition, cols, rows } = (opts.propsData as any).widget;

    if (pinnedPosition) {
      style.gridArea = `${pinnedPosition.y} / ${pinnedPosition.x} / span ${rows} / span ${cols}`;
    }

    if (id === this.activeItemId && this.activeItemPos) {
      const { x, y } = this.activeItemPos;
      style.gridArea = `${y} / ${x} / span ${rows} / span ${cols}`;
    }

    return style;
  }

  render(createElement: CreateElement) {
    return createElement(
      'div',
      { class: 'grid-container' },
      [
        createElement(
          'div',
          { class: 'grid-main-container' },
          // Children
          [
            ...(this.$slots.default || [])
              .filter(slot => slot.tag)
              .map((slot: any) => createElement(
                GridItem,
                {
                  style: this.slotStyle(slot),
                  props: {
                    ...slot.data.attrs,
                    ...slot.componentOptions.propsData,
                    editable: this.editable,
                  },
                  on: {
                    'start-edit': this.startInteraction,
                    'stop-edit': this.stopInteraction,
                    'move': this.moveInteraction,
                    'size': this.updateItemSize,
                    'position': this.updateItemPosition,
                  },
                },
                [slot],
              )),
            // show overlay grid in edit mode
            this.editable && createElement(
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
