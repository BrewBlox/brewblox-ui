<script lang="ts">
import { useGlobals } from '@/composables';
import { startupDone } from '@/user-settings';
import { rotatedSize } from '@/utils/coordinates';
import { createDialog } from '@/utils/dialog';
import { keyEventString } from '@/utils/events';
import { uniqueFilter } from '@/utils/functional';
import { loadFile } from '@/utils/import-export';
import { deepCopy } from '@/utils/objects';
import { clampRotation } from '@/utils/quantity';
import * as d3 from 'd3';
import isEqual from 'lodash/isEqual';
import throttle from 'lodash/throttle';
import { nanoid } from 'nanoid';
import {
  computed,
  defineComponent,
  nextTick,
  ref,
  UnwrapRef,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';
import {
  normalizeSelectArea,
  useDragSelect,
  useFlowParts,
  useSvgZoom,
  UseSvgZoomDimensions,
} from './composables';
import { useMetrics } from './composables/use-metrics';
import { builderTools, SQUARE_SIZE } from './const';
import { useBuilderStore } from './store';
import {
  BuilderLayout,
  BuilderTool,
  BuilderToolName,
  FlowPart,
  PersistentPart,
} from './types';
import {
  asStatePart,
  coord2grid,
  coord2translate,
  grid2coord,
  startAddLayout,
  startChangeLayoutTitle,
} from './utils';

type SVGSelection = d3.Selection<SVGElement, unknown, null, undefined>;

type ToolSource = 'shortcut' | 'menu' | 'click';

/**
 * A group of parts that is currently being moved.
 * For performance reasons, this is kept as a local variable,
 * as the x/y coordinates will be constantly updated.
 *
 * All parts in the floater will be rendered at `floater.x + part.x` / `floater.y + part.y`.
 * This way, only floater.x/y have to be updated to move all contained parts.
 */
interface Floater extends XYPosition {
  parts: FlowPart[];
}

const moveKeys: Record<string, XYPosition> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

export default defineComponent({
  name: 'BuilderEditor',
  props: {
    routeId: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const builderStore = useBuilderStore();
    const { dense } = useGlobals.setup();
    const router = useRouter();

    const history = ref<string[]>([]);
    const undoneHistory = ref<string[]>([]);

    const toolsMenuExpanded = ref<boolean>(!dense.value);
    const activeToolId = ref<BuilderToolName | null>('pan');

    const gridHoverPos = ref<XYPosition | null>(null);
    const partDragStart = ref<XYPosition | null>(null);

    const selectedIds = ref<string[]>([]);
    const configuredPart = ref<FlowPart | null>(null);
    const floater = ref<UnwrapRef<Floater> | null>(null);

    const focusRef = ref<HTMLElement>();
    const hasFocus = ref<boolean>(true);

    function checkFocus(): void {
      nextTick(() => {
        hasFocus.value = focusRef.value?.matches(':focus-within') === true;
      });
    }

    function setFocus(): void {
      focusRef.value?.focus();
      checkFocus();
    }

    const focusWarningEnabled = computed<boolean>({
      get: () => builderStore.focusWarningEnabled,
      set: (v) => (builderStore.focusWarningEnabled = v),
    });

    const layouts = computed<BuilderLayout[]>(() => builderStore.layouts);

    const layoutId = computed<string | null>(() => props.routeId || null);

    useMetrics.setupProvider(layoutId);
    const { layout, parts, flowParts, flowPartsRevision, calculateFlowParts } =
      useFlowParts.setup(layoutId);

    const layoutTitle = computed<string>(
      () => layout.value?.title ?? 'Builder editor',
    );

    function editTitle(): void {
      startChangeLayoutTitle(layout.value);
    }

    const gridDimensions = computed<UseSvgZoomDimensions>(() => ({
      width: coord2grid(layout.value?.width ?? 10),
      height: coord2grid(layout.value?.height ?? 10),
    }));

    const activeTool = computed<BuilderTool | null>(
      () => builderTools.find((v) => v.value === activeToolId.value) ?? null,
    );

    const dragEnabled = computed<boolean>(() => activeToolId.value === 'pan');

    const cursor = computed<string>(() => activeTool.value?.cursor ?? 'auto');

    const { svgRef, svgContentRef, resetZoom } = useSvgZoom.setup(
      gridDimensions,
      { dragEnabled },
    );

    const {
      activeSelectArea,
      selectAreaRef,
      startDragSelect,
      updateDragSelect,
      stopDragSelect,
      makeSelectAreaFilter,
      getDragDistance,
    } = useDragSelect.setup();

    function selectLayout(id: string | null): void {
      if (id !== layoutId.value) {
        flowParts.value = [];
        const route = id ? `/builder/${id}` : '/builder';
        router.push(route);
      }
    }

    async function createLayout(): Promise<void> {
      const id = await startAddLayout();
      setFocus();
      if (id) {
        selectLayout(id);
      }
    }

    async function importLayout(): Promise<void> {
      loadFile<BuilderLayout>(async (layout) => {
        const id = nanoid();
        await builderStore.createLayout({ ...layout, id });
        selectLayout(id);
      });
    }

    function saveParts(updated: PersistentPart[], saveHistory = true): void {
      if (saveHistory) {
        history.value.push(JSON.stringify(parts.value));
        undoneHistory.value = [];
      }
      parts.value = updated;
    }

    function savePart(part: PersistentPart): void {
      saveParts(parts.value.map((v) => (v.id === part.id ? part : v)));
    }

    function removePart(part: PersistentPart): void {
      saveParts(parts.value.filter((v) => v.id !== part.id));
    }

    // Return the grid coordinates of the current event
    function toCoords(pos: XYPosition): XYPosition;
    function toCoords(pos: XYPosition | null): XYPosition | null;
    function toCoords(pos: XYPosition | null): XYPosition | null {
      return pos !== null
        ? {
            x: Math.floor(pos.x / SQUARE_SIZE),
            y: Math.floor(pos.y / SQUARE_SIZE),
          }
        : null;
    }

    function isFloating(part: FlowPart): boolean {
      return floater.value?.parts.some((p) => p.id === part.id) === true;
    }

    function makeFloater(source: Floater): void {
      floater.value = deepCopy(source);
    }

    const moveFloater = throttle(({ x, y }: XYPosition): void => {
      if (floater.value) {
        floater.value = { ...floater.value, x, y };
      }
    }, 50);

    function dropFloater(coords: XYPosition | null): void {
      if (!floater.value) {
        return;
      }
      const source = floater.value;

      if (coords) {
        const ids: string[] = [];

        floater.value.parts.forEach((part) => {
          ids.push(part.id);
          part.x += coords.x;
          part.y += coords.y;
        });

        saveParts([
          ...parts.value.filter((p) => !ids.includes(p.id)),
          ...source.parts,
        ]);
      }

      cancelSelection();
      floater.value = null;
    }

    function cancelFloater(): void {
      if (floater.value) {
        selectedIds.value = [...floater.value.parts]
          .map((v) => v.id)
          .filter((id) => flowParts.value.some((v) => v.id === id));
        floater.value = null;
      }
    }

    function findPartAtCoords(coords: XYPosition | null): FlowPart | null {
      // iterate right to left to match rendering order
      // when items overlap, the later item is rendered on top
      if (coords) {
        for (let idx = flowParts.value.length - 1; idx >= 0; idx--) {
          const part = flowParts.value[idx];
          const [sizeX, sizeY] = rotatedSize(part.rotate, part.size);
          if (
            coords.x >= part.x &&
            coords.x < part.x + sizeX &&
            coords.y >= part.y &&
            coords.y < part.y + sizeY
          ) {
            return deepCopy(part);
          }
        }
      }
      return null;
    }

    function findHoveredPart(): FlowPart | null {
      return findPartAtCoords(toCoords(gridHoverPos.value));
    }

    function findActiveParts(alwaysIncludeSelected = false): FlowPart[] {
      const hovered = findHoveredPart();

      if (hovered) {
        return selectedIds.value.length &&
          (alwaysIncludeSelected || selectedIds.value.includes(hovered.id))
          ? deepCopy(
              flowParts.value.filter((v) => selectedIds.value.includes(v.id)),
            )
          : [hovered];
      } else if (alwaysIncludeSelected) {
        return deepCopy(
          flowParts.value.filter((v) => selectedIds.value.includes(v.id)),
        );
      } else {
        return [];
      }
    }

    function isHoveringUnselectedPart(): boolean {
      const hovered = findHoveredPart();
      return Boolean(
        hovered &&
          selectedIds.value.length &&
          !selectedIds.value.some((v) => v === hovered.id),
      );
    }

    function closeMenu(): void {
      configuredPart.value = null;
      nextTick(setFocus);
    }

    function toggleSelect(id: string | null): void {
      if (id) {
        if (selectedIds.value.length === 1 && selectedIds.value[0] === id) {
          selectedIds.value = [];
        } else {
          selectedIds.value = [id];
        }
      }
    }

    function cancelSelection(): void {
      stopDragSelect();
      selectedIds.value = [];
    }

    function clear(): void {
      if (floater.value) {
        cancelFloater();
      } else if (activeSelectArea.value) {
        stopDragSelect();
      } else {
        selectedIds.value = [];
      }
    }

    ////////////////////////////////////////////////////////////////
    // Tools
    ////////////////////////////////////////////////////////////////

    function usePan(): void {
      activeToolId.value = 'pan';
    }

    function useSelect(): void {
      if (activeToolId.value !== 'select') {
        activeToolId.value = 'select';
      } else {
        const part = findHoveredPart();
        if (part) {
          toggleSelect(part.id);
        }
      }
    }

    function useGridResize(): void {
      activeToolId.value = 'gridresize';
      cancelFloater();
    }

    function useAdd(): void {
      if (!floater.value) {
        createDialog({
          component: 'BuilderCatalogDialog',
        })
          .onOk((part: PersistentPart) => {
            makeFloater({
              x: 0,
              y: 0,
              parts: [{ ...asStatePart(part), flows: {} }],
            });
            nextTick(setFocus);
          })
          .onDismiss(setFocus);
      }
    }

    function useMove(src: ToolSource): void {
      if (activeToolId.value !== 'move') {
        activeToolId.value = 'move';
        cancelFloater();
      }

      // Menu clicks only activate the mode
      if (src === 'menu') {
        return;
      }

      if (floater.value) {
        dropFloater(toCoords(gridHoverPos.value));
        return;
      }

      if (isHoveringUnselectedPart()) {
        cancelSelection();
        return;
      }

      const activeParts = findActiveParts(true);
      if (activeParts.length) {
        // gridHoverPos will not be set if the tool is used by clicking on the tools menu
        const { x, y } = toCoords(gridHoverPos.value) ?? { x: 0, y: 0 };
        const minX = Math.min(...activeParts.map((part) => part.x));
        const minY = Math.min(...activeParts.map((part) => part.y));
        const parts = activeParts.map((part) => ({
          ...part,
          x: part.x - minX,
          y: part.y - minY,
        }));

        makeFloater({ x, y, parts });
      }
    }

    function useCopy(src: ToolSource): void {
      if (activeToolId.value !== 'copy') {
        activeToolId.value = 'copy';
        cancelFloater();
      }

      // Menu clicks only activate the mode
      if (src === 'menu') {
        return;
      }

      if (floater.value) {
        dropFloater(toCoords(gridHoverPos.value));
        return;
      }

      if (isHoveringUnselectedPart()) {
        cancelSelection();
        return;
      }

      const activeParts = findActiveParts(true);
      if (activeParts.length) {
        // gridHoverPos will not be set if the tool is used by clicking on the tools menu
        const { x, y } = toCoords(gridHoverPos.value) ?? { x: 0, y: 0 };
        const minX = Math.min(...activeParts.map((part) => part.x));
        const minY = Math.min(...activeParts.map((part) => part.y));
        const parts = activeParts.map((part) => ({
          ...part,
          id: nanoid(),
          x: part.x - minX,
          y: part.y - minY,
        }));
        makeFloater({ x, y, parts });
      }
    }

    function useRotate(): void {
      if (floater.value) {
        if (floater.value.parts.length === 1) {
          const part = floater.value.parts[0];
          part.rotate = clampRotation(part.rotate + 90);
        }
      } else {
        activeToolId.value = 'rotate';
        const part = findHoveredPart();
        if (part) {
          savePart({ ...part, rotate: clampRotation(part.rotate + 90) });
        }
      }
    }

    function useFlip(): void {
      if (floater.value) {
        if (floater.value.parts.length === 1) {
          const part = floater.value.parts[0];
          part.flipped = !part.flipped;
        }
      } else {
        activeToolId.value = 'flip';
        const part = findHoveredPart();
        if (part) {
          savePart({ ...part, flipped: !part.flipped });
        }
      }
    }

    function useEdit(): void {
      activeToolId.value = 'edit';
      if (floater.value) {
        cancelFloater();
      } else {
        const part = findHoveredPart();
        if (part) {
          configuredPart.value = part;
        }
      }
    }

    function useInteract(): void {
      activeToolId.value = 'interact';
      if (floater.value) {
        cancelFloater();
      }
    }

    function useDelete(): void {
      if (activeToolId.value !== 'delete') {
        activeToolId.value = 'delete';
        cancelFloater();
      }

      if (isHoveringUnselectedPart()) {
        cancelSelection();
        return;
      }

      const activeParts = findActiveParts(true);
      if (activeParts.length) {
        const ids = activeParts.map((p) => p.id);
        saveParts(parts.value.filter((p) => !ids.includes(p.id)));
        cancelFloater();
        cancelSelection();
      }
    }

    function useUndo(): void {
      if (floater.value) {
        cancelFloater();
        return;
      }

      const state = history.value.pop();
      if (state) {
        undoneHistory.value.push(JSON.stringify(parts.value));
        parts.value = JSON.parse(state);
      }
    }

    function useRedo(): void {
      if (floater.value) {
        cancelFloater();
        return;
      }

      const state = undoneHistory.value.pop();
      if (state) {
        history.value.push(JSON.stringify(parts.value));
        parts.value = JSON.parse(state);
      }
    }

    const builderToolActions: Record<
      BuilderToolName,
      (src: ToolSource) => void
    > = {
      pan: usePan,
      select: useSelect,
      gridresize: useGridResize,
      add: useAdd,
      move: useMove,
      copy: useCopy,
      rotate: useRotate,
      flip: useFlip,
      edit: useEdit,
      interact: useInteract,
      delete: useDelete,
      undo: useUndo,
      redo: useRedo,
    };

    function useTool(name: BuilderToolName, src: ToolSource): void {
      const action = builderToolActions[name];
      if (action) {
        action(src);
        setFocus();
      }
    }

    const disabledTools = computed<BuilderToolName[]>(() => {
      const tools: BuilderToolName[] = [];
      if (floater.value) {
        tools.push('add', 'edit', 'interact');
        if (floater.value.parts.length > 1) {
          tools.push('rotate', 'flip');
        }
      } else if (selectedIds.value.length > 1) {
        tools.push('interact', 'edit', 'rotate', 'flip');
      }
      if (!history.value.length) {
        tools.push('undo');
      }
      if (!undoneHistory.value.length) {
        tools.push('redo');
      }
      return tools;
    });

    ////////////////////////////////////////////////////////////////
    // Event handlers
    ////////////////////////////////////////////////////////////////

    function deltaMove(delta: XYPosition): void {
      const activeParts = findActiveParts(true);
      activeParts.forEach((part) => {
        part.x += delta.x;
        part.y += delta.y;
      });
      const ids = activeParts.map((v) => v.id);
      saveParts([
        ...parts.value.filter((p) => !ids.includes(p.id)),
        ...activeParts,
      ]);
    }

    function keyHandler(evt: KeyboardEvent): void {
      const key = keyEventString(evt);
      const keyDelta = moveKeys[key];
      const tool = builderTools.find((v) => v.shortcut === key);

      if (key === 'Escape') {
        clear();
      } else if (keyDelta) {
        deltaMove(keyDelta);
      } else if (tool) {
        if (!disabledTools.value.includes(tool.value)) {
          useTool(tool.value, 'shortcut');
        }
      } else {
        return; // not handled - don't stop propagation
      }
      evt.stopPropagation();
      evt.preventDefault();
    }

    // Return the exact position of the current event
    function d3EventPos(evt: Event): XYPosition {
      const [x, y] = d3.pointer(evt, svgContentRef.value!);
      return { x, y };
    }

    function gridHoverHandler(selection: SVGSelection): SVGSelection {
      const throttledMove = throttle((gridPos: XYPosition) => {
        gridHoverPos.value = gridPos;
        const coords = toCoords(gridPos);
        if (floater.value) {
          floater.value.x = coords.x;
          floater.value.y = coords.y;
        }
      }, 50);
      return selection
        .on('mouseenter', (evt) => throttledMove(d3EventPos(evt)))
        .on('mousemove', (evt) => throttledMove(d3EventPos(evt)))
        .on('mouseout', () => {
          gridHoverPos.value = null;
        });
    }

    const gridResizeDragHandler = d3
      .drag<SVGElement, unknown>()
      .on('start', (evt) => {
        const { x, y } = d3EventPos(evt);
        const sqX = coord2grid(grid2coord(x));
        const sqY = coord2grid(grid2coord(y));
        startDragSelect({
          startX: sqX,
          startY: sqY,
          endX: sqX,
          endY: sqY,
        });
      })
      .on('drag', (evt) => {
        const { x, y } = d3EventPos(evt);
        const sqX = coord2grid(grid2coord(x));
        const sqY = coord2grid(grid2coord(y));
        updateDragSelect(sqX, sqY);
      })
      .on('end', () => {
        if (activeSelectArea.value && layout.value) {
          const { startX, startY, endX, endY } = normalizeSelectArea(
            activeSelectArea.value,
          );
          stopDragSelect();

          if (startX === endX || startY === endY) {
            return;
          }

          // Saving parts also saves layout
          layout.value.width = grid2coord(endX - startX);
          layout.value.height = grid2coord(endY - startY);

          const offsetX = grid2coord(startX);
          const offsetY = grid2coord(startY);

          parts.value = parts.value.map((part) => ({
            ...part,
            x: part.x - offsetX,
            y: part.y - offsetY,
          }));
        }
      });

    const gridDragHandler = d3
      .drag<SVGElement, unknown>()
      .clickDistance(25)
      .on('start', (evt) => {
        if (!floater.value) {
          const { x, y } = d3EventPos(evt);
          startDragSelect({
            startX: x,
            startY: y,
            endX: x,
            endY: y,
          });
        }
      })
      .on('drag', (evt) => {
        const { x, y } = d3EventPos(evt);
        updateDragSelect(x, y);
      })
      .on('end', async (evt) => {
        if (floater.value) {
          dropFloater(toCoords(d3EventPos(evt)));
          return;
        }

        const { altKey, shiftKey } = evt;

        const sourceIds = deepCopy(selectedIds.value);
        const targetIds = flowParts.value
          .filter(makeSelectAreaFilter())
          .map((v) => v.id);

        if (shiftKey) {
          selectedIds.value = [...sourceIds, ...targetIds].filter(uniqueFilter);
        } else if (altKey) {
          selectedIds.value = [
            ...sourceIds.filter((id) => !targetIds.includes(id)),
          ];
        } else if (getDragDistance() < 10 && findHoveredPart() != null) {
          // small drag on top of a part
          // this will be handled by the click handler
        } else {
          selectedIds.value = [...targetIds];
        }

        stopDragSelect();
      });

    const partDragHandler = d3
      .drag()
      .clickDistance(25)
      .on('start', (evt) => {
        // We're not sure yet whether this is a drag or a click
        // The action becomes a drag once the mouse leaves the square
        // The action is a click if the mouseup event is in the same square
        partDragStart.value = toCoords(d3EventPos(evt));
      })
      .on('drag', function (this: Element, evt) {
        const { x, y } = toCoords(d3EventPos(evt));
        const start = partDragStart.value;

        // We're already dragging.
        if (floater.value) {
          moveFloater({ x, y });
        }
        // Check if the drag event has left the initial square
        // Create a floater when this happens
        else if (start && !isEqual(start, { x, y })) {
          const targetId = this.getAttribute('part-id')!;
          const partIds = selectedIds.value.includes(targetId)
            ? [...selectedIds.value]
            : [targetId];
          const parts = flowParts.value
            .filter((part) => partIds.includes(part.id))
            .map((part) => ({
              ...part,
              id: activeToolId.value === 'copy' ? nanoid() : part.id,
              x: part.x - start.x,
              y: part.y - start.y,
            }));

          makeFloater({ x, y, parts });
        }
      })
      .on('end', (evt) => {
        partDragStart.value = null;
        dropFloater(toCoords(d3EventPos(evt)));
      });

    function selectGridHandlers(
      el: SVGElement,
      tool: BuilderToolName | null,
    ): void {
      const selection = d3.select(el);
      selection.call(gridHoverHandler);

      selection.on('click', (evt) => {
        if (floater.value) {
          dropFloater(toCoords(d3EventPos(evt)));
        }
      });

      if (tool && ['select', 'copy', 'move', 'delete'].includes(tool)) {
        selection.call(gridDragHandler);
      } else if (tool === 'gridresize') {
        selection.call(gridResizeDragHandler);
      } else {
        // pan is handled by useSvgZoom
        selection.on('.drag', null);
      }
    }

    function selectPartHandlers(
      el: SVGElement,
      tool: BuilderToolName | null,
    ): void {
      const partSelection = d3.select(el).selectAll<Element, any>('.flowpart');

      if (tool === 'move' || tool === 'copy') {
        partSelection.call(partDragHandler);
      } else {
        partSelection.on('.drag', null);
      }

      if (
        tool &&
        [
          'select',
          'new',
          'move',
          'copy',
          'rotate',
          'flip',
          'edit',
          'delete',
        ].includes(tool)
      ) {
        partSelection.on('click', function (evt: Event) {
          builderToolActions[tool]('click');
          evt.stopPropagation();
        });
      } else {
        partSelection.on('click', null);
      }
    }

    watch(
      () => layoutId.value,
      (newV, oldV) => {
        if (newV !== oldV) {
          history.value = [];
          undoneHistory.value = [];
          builderStore.lastLayoutId = newV;
          nextTick(() => setFocus());
        }
      },
      { immediate: true },
    );

    watch(
      () => layoutTitle.value,
      (title) => (document.title = `Brewblox | ${title}`),
      { immediate: true },
    );

    watch(
      [svgRef, activeToolId],
      ([el, tool]) => el && selectGridHandlers(el, tool),
      { immediate: true },
    );

    watch(
      [svgContentRef, activeToolId, flowPartsRevision],
      async ([el, tool]) => {
        await nextTick();
        if (el) {
          selectPartHandlers(el, tool);
        }
        if (configuredPart.value) {
          const id = configuredPart.value.id;
          configuredPart.value =
            flowParts.value.find((v) => v.id === id) ?? null;
        }
      },
      { immediate: true },
    );

    return {
      coord2grid,
      coord2translate,

      dense,
      svgRef,
      svgContentRef,
      resetZoom,
      flowParts,
      flowPartsRevision,
      calculateFlowParts,

      focusRef,
      hasFocus,
      checkFocus,
      setFocus,
      focusWarningEnabled,

      selectAreaRef,
      selectedIds,
      floater,
      isFloating,

      startupDone,
      layouts,
      layoutId,
      layout,
      layoutTitle,
      editTitle,
      selectLayout,
      createLayout,
      importLayout,
      savePart,
      removePart,

      configuredPart,
      closeMenu,

      activeToolId,
      disabledTools,
      toolsMenuExpanded,
      useTool,
      cursor,

      keyHandler,
    };
  },
});
</script>

<template>
  <q-page
    class="page-height"
    @keydown="keyHandler"
  >
    <BuilderPartSettingsDialog
      v-if="configuredPart"
      :part="configuredPart"
      :rev="flowPartsRevision"
      @update:part="savePart"
      @remove:part="removePart"
      @reflow="calculateFlowParts"
      @hide="closeMenu"
    />

    <TitleTeleport v-if="layout">
      <span
        class="cursor-pointer"
        @click="editTitle"
      >
        {{ layoutTitle }}
      </span>
    </TitleTeleport>

    <ButtonsTeleport v-if="layout">
      <q-btn
        flat
        round
        icon="mdi-tools"
        class="self-center"
        color="primary"
        :to="`/brewery/${layoutId}`"
      >
        <q-tooltip>Leave editor</q-tooltip>
      </q-btn>
      <ActionMenu
        round
        class="self-center"
        label="Builder actions"
      >
        <template #menus>
          <LayoutActions :layout="layout" />
        </template>
        <template #actions>
          <ActionItem
            label="New layout"
            icon="add"
            @click="createLayout"
          />
          <ActionItem
            icon="mdi-file-import"
            label="Import Layout"
            @click="importLayout"
          />
          <ActionItem
            label="Reset zoom"
            icon="mdi-stretch-to-page-outline"
            @click="resetZoom"
          />
          <ToggleAction
            v-model="focusWarningEnabled"
            label="Show focus warning"
          />
        </template>
      </ActionMenu>
    </ButtonsTeleport>

    <!-- Still waiting for datastore -->
    <div
      v-if="!startupDone"
      class="text-h5 darkened absolute-center column items-center q-gutter-md"
    >
      <q-spinner size="30px" />
      <div>Waiting for datastore...</div>
    </div>

    <!-- No layout selected -->
    <PageError v-if="!layout">
      <template v-if="layouts.length">
        Select a layout
        <ListSelect
          :model-value="null"
          :options="layouts"
          option-value="id"
          option-label="title"
          option-class="q-px-md"
          class="q-mx-lg q-my-md"
          style="color: white"
          @update:model-value="(v) => v && selectLayout(v.id)"
        />
        or
      </template>
      <q-btn
        outline
        color="secondary"
        label="Create a layout"
        class="q-mx-lg self-stretch"
        @click="createLayout"
      />
    </PageError>

    <!-- Grid -->
    <div
      v-else
      ref="focusRef"
      class="fit"
      tabindex="-1"
      @focusout="checkFocus"
    >
      <svg
        ref="svgRef"
        class="fit"
        :style="{ cursor }"
      >
        <g ref="svgContentRef">
          <EditorBackground
            v-if="activeToolId !== 'interact' || floater"
            :width="layout.width"
            :height="layout.height"
          />
          <!-- All parts, hidden if floating -->
          <g
            v-for="part in flowParts"
            v-show="!isFloating(part)"
            :key="`${flowPartsRevision}-${part.id}`"
            :part-id="part.id"
            :class="['flowpart', part.type]"
          >
            <PartWrapper
              :part="part"
              :coord-x="part.x"
              :coord-y="part.y"
              :selected="selectedIds.includes(part.id)"
              :selectable="!['interact', 'pan', null].includes(activeToolId)"
              :interactable="activeToolId === 'interact'"
              @update:part="savePart"
              @reflow="calculateFlowParts"
            />
          </g>
          <!-- Floating parts -->
          <g
            v-if="floater"
            :transform="coord2translate(floater.x, floater.y)"
          >
            <g
              v-for="part in floater.parts"
              :key="`floating-${part.id}`"
              :class="[part.type]"
            >
              <PartWrapper
                :part="part"
                :coord-x="part.x"
                :coord-y="part.y"
                selected
              />
            </g>
          </g>
          <!-- Indicators for multiple parts sharing the same top/left coordinates-->
          <OverlapIndicators :parts="flowParts" />
          <!-- Selection area -->
          <rect
            ref="selectAreaRef"
            stroke="white"
            fill="dodgerblue"
            opacity="0.3"
            style="pointer-events: none"
          />
        </g>
      </svg>
      <BuilderToolsMenu
        v-model:expanded="toolsMenuExpanded"
        :active-tool="activeToolId"
        :disabled-tools="disabledTools"
        @use="(v) => useTool(v, 'menu')"
        @touchstart.stop
        @mousedown.stop
      />
      <div
        v-if="!hasFocus && focusWarningEnabled"
        class="unfocus-overlay"
        @click.stop="setFocus"
        @contextmenu="(evt) => !evt.shiftKey && evt.preventDefault()"
      >
        <transition
          appear
          name="fade"
        >
          <div class="unfocus-message">Click to resume editing</div>
        </transition>
      </div>
    </div>
  </q-page>
</template>

<style lang="sass" scoped>
.q-page-container
  max-height: 100vh
  max-width: 100vw

.unfocus-overlay
  position: absolute
  top: 0
  left: 0
  height: 100%
  width: 100%
  background-color: rgba(0, 0, 0, 0.5)
  transition: 1s

.unfocus-message
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  padding: 20px
  border: 2px solid silver
  border-radius: 40px
  color: white
  background-color: rgba(0, 0, 0, 0.7)
  font-size: 1.8rem

.fade-enter-active
  transition: opacity 4s ease

.fade-enter
  opacity: 0

  &-to
    opacity: 1
</style>
