<script setup lang="ts">
import GridItem from './GridItem.vue';
import { GRID_GAP_SIZE, GRID_SQUARE_SIZE } from './const';
import { WidgetContext } from '@/store/features';
import { useWidgetStore, Widget } from '@/store/widgets';
import { nullFilter } from '@/utils/functional';
import { CSSProperties, computed, ref } from 'vue';

interface Props {
  widgets: Widget[];
  context: WidgetContext;
  editable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
});

const widgetStore = useWidgetStore();
const containerRef = ref<HTMLDivElement>();

const minWidth = computed<number>(() =>
  props.widgets.reduce((width: number, widget: Widget) => {
    const { cols, pinnedPosition } = widget;
    const minCols = cols + (pinnedPosition?.x ?? 1) - 1;
    return Math.max(
      width,
      minCols * GRID_SQUARE_SIZE + minCols * GRID_GAP_SIZE,
    );
  }, 0),
);

const gridStyle = computed<CSSProperties>(() => {
  return {
    minHeight: props.editable ? '3000px' : '0px',
    minWidth: `${minWidth.value}px`,
  };
});

async function saveWidget(widget: Widget): Promise<void> {
  return widgetStore.saveWidget(widget);
}

function patchWidgets(updated: Patch<Widget>[]): void {
  updated
    .map((change) => {
      const existing = widgetStore.widgetById(change.id);
      return existing ? { ...existing, ...change } : null;
    })
    .filter(nullFilter)
    .forEach((v) => saveWidget(v));
}

function updateItemPosition(updatedId: string, pos: XYPosition | null): void {
  const updated = Array.from(
    containerRef.value!.getElementsByClassName('grid-item'),
  )
    .map((el): [string, DOMRect] => [
      el.getAttribute('widget-id')!,
      el.getBoundingClientRect(),
    ])
    .sort(([, rectA], [, rectB]) => rectA.y - rectB.y || rectA.x - rectB.x)
    .map(([id], idx) =>
      id === updatedId
        ? { id, order: idx + 1, pinnedPosition: pos }
        : { id, order: idx + 1 },
    );
  patchWidgets(updated);
}

function updateItemSize(id: string, cols: number, rows: number): void {
  patchWidgets([{ id, cols, rows }]);
}
</script>

<template>
  <div
    ref="containerRef"
    class="grid-container grid-main-container"
    :style="gridStyle"
  >
    <GridItem
      v-for="widget in widgets"
      :key="`grid-item-${widget.id}`"
      :widget-id="widget.id"
      :editable="editable"
      @size="updateItemSize"
      @position="updateItemPosition"
    >
      <WidgetWrapper
        :context="context"
        :widget="widget"
        class="fit"
        @update:widget="saveWidget"
        @dblclick.stop
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
  background-position:
    0 -20px,
    -20px,
    0 0;
  grid-column-start: 1;
  grid-column-end: -1;
  grid-row-start: 1;
  grid-row-end: 1 span;
  opacity: 0.03;
}
</style>
