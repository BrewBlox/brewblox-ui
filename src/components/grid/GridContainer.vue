<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import { Widget } from '@/store/dashboards';
import { WidgetContext } from '@/store/features';

import { GRID_GAP_SIZE, GRID_SQUARE_SIZE } from './const';
import GridItem from './GridItem.vue';
import { ValidatedWidget } from './types';

export default defineComponent({
  name: 'GridContainer',
  components: {
    GridItem,
  },
  props: {
    widgets: {
      type: Array as PropType<ValidatedWidget[]>,
      required: true,
    },
    context: {
      type: Object as PropType<WidgetContext>,
      required: true,
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'patch:widgets',
    'dblclick',
  ],
  setup(props, { emit }) {
    const containerRef = ref<HTMLDivElement>();

    const minWidth = computed<number>(
      () => props.widgets
        .reduce(
          (width: number, widget: ValidatedWidget) => {
            const { cols, pinnedPosition } = widget.crud.widget;
            const minCols = cols + (pinnedPosition?.x ?? 1) - 1;
            return Math.max(width, minCols * GRID_SQUARE_SIZE + minCols * GRID_GAP_SIZE);
          },
          0,
        ),
    );

    const gridStyle = computed<Mapped<string>>(
      () => {
        return {
          minHeight: props.editable ? '3000px' : '0px',
          minWidth: `${minWidth.value}px`,
        };
      },
    );

    function updateItemPosition(updatedId: string, pos: XYPosition | null): void {
      const updated = Array.from(containerRef.value!.getElementsByClassName('grid-item'))
        .map((el): [string, DOMRect] => [el.getAttribute('widget-id')!, el.getBoundingClientRect()])
        .sort(([, rectA], [, rectB]) => (rectA.y - rectB.y) || (rectA.x - rectB.x))
        .map(([id], idx) =>
          id === updatedId
            ? { id, order: idx + 1, pinnedPosition: pos }
            : { id, order: idx + 1 },
        );
      emit('patch:widgets', updated);
    }

    function updateItemSize(id: string, cols: number, rows: number): void {
      const updated: Partial<Widget>[] = [{ id, cols, rows }];
      emit('patch:widgets', updated);
    }

    function onDoubleClick(evt: MouseEvent): void {
      if (evt.target === evt.currentTarget) {
        emit('dblclick');
      }
    }

    return {
      containerRef,
      gridStyle,
      onDoubleClick,
      updateItemSize,
      updateItemPosition,
    };
  },
});
</script>

<template>
  <div
    ref="containerRef"
    class="grid-container grid-main-container"
    :style="gridStyle"
    @dblclick="onDoubleClick"
  >
    <GridItem
      v-for="item in widgets"
      :key="`grid-item-${item.id}`"
      :widget="item.crud.widget"
      :editable="editable"
      @size="updateItemSize"
      @position="updateItemPosition"
    >
      <component
        :is="item.component"
        :crud="item.crud"
        :context="context"
        :error="item.error"
        class="fit"
      />
    </GridItem>
    <div
      v-if="editable"
      class="grid-container-overlay"
    >
      <div class="grid-container-overlay-grid" />
    </div>
  </div>
</template>

<style scoped lang="scss">
// Grid square / gap size values are hardcoded here at 100px/20px

.grid-container {
  background-color: transparent;
  position: relative;
}

.grid-main-container,
.grid-container-overlay {
  position: relative;
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fill, 100px);
  grid-auto-columns: 100px;
  grid-auto-rows: 100px;
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
