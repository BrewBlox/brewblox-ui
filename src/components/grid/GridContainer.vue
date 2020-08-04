<script lang="ts">
import Vue, { CreateElement, VNode } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { WidgetProps } from '@/components/WidgetBase';
import { Widget } from '@/store/dashboards';

import GridItem from './GridItem.vue';

@Component({
  components: { GridItem },
})
export default class GridContainer extends Vue {

  @Prop({ type: Boolean, default: false })
  readonly editable!: boolean;

  updateItemPosition(updatedId: string, pos: XYPosition | null): void {
    const updated: Partial<Widget>[] = this.$children
      .map(item => [item, item.$el.getBoundingClientRect()] as [GridItem, DOMRect])
      .sort(([, rectA], [, rectB]) => (rectA.y - rectB.y) || (rectA.x - rectB.x))
      .map(([{ id }], idx) =>
        id === updatedId
          ? { id, order: idx + 1, pinnedPosition: pos }
          : { id, order: idx + 1 }
      );
    this.$emit('patch:widgets', updated);
  }

  updateItemSize(id: string, cols: number, rows: number): void {
    const updated: Partial<Widget>[] = [{ id, cols, rows }];
    this.$emit('patch:widgets', updated);
  }

  slotProps(slot: VNode): WidgetProps {
    return slot.componentOptions!.propsData as WidgetProps;
  }

  renderOverlay(h: CreateElement): VNode {
    return h('div',
      { class: 'grid-container-overlay' },
      [h('div', { class: 'grid-container-overlay-grid' })],
    );
  }

  renderWidgets(h: CreateElement): VNode[] {
    const children = (this.$slots.default || [])
      .filter(slot => !!slot.tag)
      .map((slot: VNode) =>
        h(
          GridItem, // Wrap each widget in a GridItem to handle dragging / moving
          {
            props: {
              widget: this.slotProps(slot).initialCrud.widget,
              editable: this.editable,
            },
            on: {
              size: this.updateItemSize,
              position: this.updateItemPosition,
            },
          },
          [slot], // The actual widget
        ));

    if (this.editable) {
      children.push(this.renderOverlay(h));
    }

    return children;
  }

  render(h: CreateElement): VNode {
    return h('div',
      {
        class: 'grid-container grid-main-container',
        on: {
          dblclick: evt => {
            if (evt.target === evt.currentTarget) {
              this.$emit('dblclick');
            }
          },
        },
      },
      this.renderWidgets(h)
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
  padding-bottom: 50%;
  min-height: 100%;
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
