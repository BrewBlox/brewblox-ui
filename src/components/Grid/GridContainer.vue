<script lang="ts">
import Vue, { CreateElement, VNode } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { WidgetProps } from '../Widget/WidgetBase';
import GridItem from './GridItem.vue';

@Component({
  components: { GridItem },
})
export default class GridContainer extends Vue {

  @Prop({ type: Boolean, default: false })
  readonly editable!: boolean;

  updateItemPosition(id: string, pos: XYPosition | null): void {
    const newItemsOrder = this.$children
      .map(item => [item, item.$el.getBoundingClientRect()] as [GridItem, DOMRect])
      .sort(([, rectA], [, rectB]) => (rectA.y - rectB.y) || (rectA.x - rectB.x))
      .map(([item]) => item.id);
    this.$emit('change-positions', id, pos, newItemsOrder);
  }

  updateItemSize(id: string, cols: number, rows: number): void {
    this.$emit('change-size', id, cols, rows);
  }

  slotProps(slot: VNode): WidgetProps {
    return slot.componentOptions!.propsData as WidgetProps;
  }

  renderOverlay(createElement: CreateElement): VNode {
    return createElement('div',
      { class: 'grid-container-overlay' },
      [createElement('div', { class: 'grid-container-overlay-grid' })],
    );
  }

  renderWidgets(createElement: CreateElement): VNode[] {
    const children = (this.$slots.default || [])
      .filter(slot => !!slot.tag)
      .map((slot: VNode) =>
        createElement(
          GridItem, // Wrap each widget in a GridItem to handle dragging / moving
          {
            props: {
              widget: this.slotProps(slot).initialCrud.widget,
              editable: this.editable,
            },
            on: {
              'size': this.updateItemSize,
              'position': this.updateItemPosition,
            },
          },
          [slot], // The actual widget
        ));

    if (this.editable) {
      children.push(this.renderOverlay(createElement));
    }

    return children;
  }

  render(createElement: CreateElement): VNode {
    return createElement(
      'div',
      { class: ['grid-container', 'grid-main-container'] },
      this.renderWidgets(createElement)
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
