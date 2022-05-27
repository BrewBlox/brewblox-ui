<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import { WidgetContext } from '@/store/features';
import { useWidgetStore, Widget } from '@/store/widgets';
import { nullFilter } from '@/utils/functional';

import { GRID_GAP_SIZE, GRID_SQUARE_SIZE } from './const';
import GridItem from './GridItem.vue';
import { RenderedItem } from './types';

export default defineComponent({
  name: 'GridContainer',
  components: {
    GridItem,
  },
  props: {
    items: {
      type: Array as PropType<RenderedItem[]>,
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
  setup(props) {
    const widgetStore = useWidgetStore();
    const containerRef = ref<HTMLDivElement>();

    const minWidth = computed<number>(() =>
      props.items.reduce((width: number, item: RenderedItem) => {
        const { cols, pinnedPosition } = item.widget;
        const minCols = cols + (pinnedPosition?.x ?? 1) - 1;
        return Math.max(
          width,
          minCols * GRID_SQUARE_SIZE + minCols * GRID_GAP_SIZE,
        );
      }, 0),
    );

    const gridStyle = computed<Mapped<string>>(() => {
      return {
        minHeight: props.editable ? '3000px' : '0px',
        minWidth: `${minWidth.value}px`,
      };
    });

    function patchWidgets(updated: Patch<Widget>[]): void {
      updated
        .map((change) => {
          const existing = widgetStore.widgetById(change.id);
          return existing ? { ...existing, ...change } : null;
        })
        .filter(nullFilter)
        .forEach((v) => widgetStore.saveWidget(v));
    }

    function updateItemPosition(
      updatedId: string,
      pos: XYPosition | null,
    ): void {
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

    return {
      containerRef,
      gridStyle,
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
  >
    <GridItem
      v-for="item in items"
      :key="`grid-item-${item.widget.id}`"
      :widget-id="item.widget.id"
      :editable="editable"
      @size="updateItemSize"
      @position="updateItemPosition"
    >
      <WidgetProvider
        :context="context"
        :widget-id="item.widget.id"
      >
        <component
          :is="item.component"
          :error="item.error"
          class="fit"
          @dblclick.stop
        />
      </WidgetProvider>
    </GridItem>
    <div
      v-if="editable"
      class="grid-container-overlay"
    >
      <div class="grid-container-overlay-grid" />
    </div>
  </div>
</template>

<style
  scoped
  lang="scss"
>
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
