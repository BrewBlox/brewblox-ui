<script lang="ts">
import * as d3 from 'd3';
import isEqual from 'lodash/isEqual';
import throttle from 'lodash/throttle';
import { nanoid } from 'nanoid';
import { QLayout, useQuasar } from 'quasar';
import {
  computed,
  defineComponent,
  nextTick,
  reactive,
  ref,
  UnwrapRef,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';

import { useGlobals } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { clampRotation, deepCopy, filterById, findById, spliceById, uniqueFilter } from '@/utils/functional';

import BuilderCatalog from './BuilderCatalog.vue';
import BuilderPartMenu from './BuilderPartMenu.vue';
import { useFlowParts, useSvgZoom, UseSvgZoomDimensions } from './composables';
import { SQUARE_SIZE } from './const';
import { builderStore } from './store';
import { BuilderLayout, FlowPart, PersistentPart } from './types';
import { squares, startAddLayout } from './utils';

interface Floater extends XYPosition {
  startX: number;
  startY: number;
  moving: boolean;
  parts: PersistentPart[];
}

interface SelectArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface EditorAction {
  label: string;
  value: string;
  icon: string;
}

interface ActionMode extends EditorAction {
  cursor: (part: PersistentPart) => boolean;
}

interface ActionTool extends EditorAction {
  shortcut: string;
  use: (parts: PersistentPart[]) => void;
}

const moveKeys: Record<string, XYPosition> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

export default defineComponent({
  name: 'BuilderEditor',
  components: {
    BuilderPartMenu,
  },
  props: {
    routeId: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { dense } = useGlobals.setup();
    const { localStorage } = useQuasar();
    const router = useRouter();

    const history = ref<string[]>([]);
    const undoneHistory = ref<string[]>([]);

    const menuDialogOpen = ref<boolean>(false);
    const focusWarning = ref<boolean>(true);

    const selectArea = ref<SelectArea | null>(null);
    const selectedIds = ref<string[]>([]);
    const gridHoverPos = ref<XYPosition | null>(null);
    const pageFocused = ref<boolean>(true);
    const partDragStart = ref<XYPosition | null>(null);

    const floater = ref<UnwrapRef<Floater> | null>(null);
    const configuredPartId = ref<string | null>(null);

    const pageRef = ref<QLayout>();

    const _drawerOpen = ref<boolean>(localStorage.getItem('drawer') ?? !dense.value);
    const drawerOpen = computed<boolean>({
      get: () => _drawerOpen.value,
      set: v => {
        _drawerOpen.value = v;
        localStorage.set('drawer', v);
      },
    });

    const drawerMode = computed<'tools' | 'layouts'>({
      get: () => builderStore.drawerMode,
      set: v => builderStore.drawerMode = v,
    });

    const modes: ActionMode[] = [
      {
        label: 'Select and move',
        value: 'select',
        icon: 'mdi-select-drag',
        cursor: part => part != null,
      },
      {
        label: 'Pan',
        value: 'zoom',
        icon: 'mdi-drag-variant',
        cursor: () => false,
      },
      {
        label: 'Interact',
        value: 'interact',
        icon: 'mdi-cursor-default',
        cursor: part => part != null
          && builderStore.spec(part).interactHandler !== undefined,
      },
    ];

    const tools: ActionTool[] = [
      {
        label: 'New',
        value: 'add',
        icon: 'add',
        shortcut: 'n',
        use: useAdd,
      },
      {
        label: 'Move',
        value: 'move',
        icon: 'mdi-cursor-move',
        shortcut: 'm',
        use: useMove,
      },
      {
        label: 'Copy',
        value: 'copy',
        icon: 'file_copy',
        shortcut: 'c',
        use: useCopy,
      },
      {
        label: 'Rotate',
        value: 'rotate-right',
        icon: 'mdi-rotate-right-variant',
        shortcut: 'r',
        use: useRotate,
      },
      {
        label: 'Flip',
        value: 'flip',
        icon: 'mdi-swap-horizontal-bold',
        shortcut: 'f',
        use: useFlip,
      },
      {
        label: 'Edit Settings',
        value: 'config',
        icon: 'settings',
        shortcut: 'e',
        use: useEdit,
      },
      {
        label: 'Interact',
        value: 'interact',
        icon: 'mdi-cursor-default',
        shortcut: 'i',
        use: useInteract,
      },
      {
        label: 'Delete',
        value: 'delete',
        icon: 'delete',
        shortcut: 'd',
        use: useDelete,
      },
    ];

    const layouts = computed<BuilderLayout[]>(
      () => builderStore.layouts,
    );

    const layoutId = computed<string | null>(
      () => props.routeId || null,
    );

    const {
      layout,
      saveLayout,
      parts,
      overlaps,
      flowParts,
      flowPartsRevision,
      calculateFlowParts,
    } = useFlowParts.setup(layoutId);

    function setLayoutWidth(v: number): void {
      if (layout.value) {
        layout.value.width = v;
        saveLayout();
      }
    }

    function setLayoutHeight(v: number): void {
      if (layout.value) {
        layout.value.height = v;
        saveLayout();
      }
    }

    const layoutTitle = computed<string>(
      () => layout.value?.title ?? 'Builder editor',
    );

    const gridDimensions = computed<UseSvgZoomDimensions>(
      () => ({
        width: squares(layout.value?.width ?? 10),
        height: squares(layout.value?.height ?? 10),
      }),
    );

    const configuredPart = computed<FlowPart | null>(
      () => flowParts.value.find(p => p.id === configuredPartId.value) ?? null,
    );

    const currentMode = computed<ActionMode>({
      get: () => {
        const toolId = builderStore.editorMode;
        return modes.find(tool => tool.value === toolId) ?? modes[0];
      },
      set: tool => builderStore.editorMode = tool.value,
    });

    const dragEnabled = computed<boolean>(
      () => currentMode.value.value === 'zoom',
    );

    const {
      svgRef,
      svgContentRef,
      resetZoom,
    } = useSvgZoom.setup(gridDimensions, { dragEnabled });

    function selectLayout(id: string | null): void {
      if (id !== layoutId.value) {
        flowParts.value = [];
        const route = id ? `/builder/${id}` : '/builder';
        router.push(route);
      }
    }

    function setFocus(): void {
      pageRef.value?.$el.focus();
      checkFocus();
    }

    function checkFocus(): void {
      nextTick(() => {
        const el = document.querySelector('.editor-page:focus-within');
        pageFocused.value = (el !== null);
      });
    }

    async function createLayout(): Promise<void> {
      const id = await startAddLayout();
      setFocus();
      if (id) {
        selectLayout(id);
      }
    }

    function saveParts(updated: PersistentPart[], saveHistory = true): void {
      if (saveHistory) {
        history.value.push(JSON.stringify(parts.value));
        undoneHistory.value = [];
      }
      parts.value = updated;
    }

    function savePart(part: PersistentPart): void {
      saveParts(spliceById(parts.value, part));
    }

    function removePart(part: PersistentPart): void {
      saveParts(filterById(parts.value, part));
    }

    function undo(): void {
      if (layout.value && history.value.length > 0) {
        cancelSelection();
        undoneHistory.value.push(JSON.stringify(parts.value));
        parts.value = JSON.parse(history.value.pop()!);
      }
    }

    function redo(): void {
      if (layout.value && undoneHistory.value.length > 0) {
        cancelSelection();
        history.value.push(JSON.stringify(parts.value));
        parts.value = JSON.parse(undoneHistory.value.pop()!);
      }
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

    function isBusy(part: PersistentPart): boolean {
      return floater.value?.parts.some(p => p.id === part.id) === true;
    }

    function clear(): void {
      floater.value = null;
      selectedIds.value = [];
    }

    function makeFloater(source: Floater): void {
      floater.value = reactive(deepCopy(source));
    }

    function dropFloater(coords: XYPosition | null): void {
      if (!floater.value) { return; }

      if (coords) {
        const ids: string[] = [];

        floater.value.parts
          .forEach(part => {
            ids.push(part.id);
            part.x += floater.value!.x;
            part.y += floater.value!.y;
          });

        saveParts([
          ...parts.value.filter(p => !ids.includes(p.id)),
          ...floater.value.parts,
        ]);
      }
      selectedIds.value = [];
      floater.value = null;
    }

    function findPartAtCoords(coords: XYPosition | null): FlowPart | null {
      // iterate right to left to match rendering order
      // when items overlap, the later item is rendered on top
      if (coords) {
        for (let idx = flowParts.value.length - 1; idx >= 0; idx--) {
          const part = flowParts.value[idx];
          if (coords.x >= part.x
            && coords.x < part.x + part.size[0]
            && coords.y >= part.y
            && coords.y < part.y + part.size[1]) {
            return deepCopy(part);
          }
        }
      }
      return null;
    }

    function findActionParts(): FlowPart[] {
      if (selectedIds.value.length) {
        return deepCopy(flowParts.value.filter(v => selectedIds.value.includes(v.id)));
      }
      const hovered = findPartAtCoords(toCoords(gridHoverPos.value));
      return hovered
        ? [hovered]
        : [];
    }

    function unflippedArea(area: SelectArea): SelectArea {
      return {
        startX: Math.min(area.startX, area.endX),
        startY: Math.min(area.startY, area.endY),
        endX: Math.max(area.startX, area.endX),
        endY: Math.max(area.startY, area.endY),
      };
    }

    function renderArea(area: SelectArea): AnyDict {
      const unflipped = unflippedArea(area);
      return {
        x: unflipped.startX,
        y: unflipped.startY,
        width: unflipped.endX - unflipped.startX,
        height: unflipped.endY - unflipped.startY,
      };
    }

    function closeMenu(): void {
      menuDialogOpen.value = false;
      nextTick(setFocus);
    }

    function leaveEditor(): void {
      router.back();
    }

    ////////////////////////////////////////////////////////////////
    // Modes
    ////////////////////////////////////////////////////////////////

    function cancelSelection(): void {
      selectArea.value = null;
      selectedIds.value = [];
    }

    ////////////////////////////////////////////////////////////////
    // Tools
    ////////////////////////////////////////////////////////////////

    function useAdd(): void {
      if (!floater.value) {
        createDialog({
          component: BuilderCatalog,
        })
          .onOk((part: PersistentPart) => {
            makeFloater({
              moving: false,
              x: 0,
              y: 0,
              startX: part.x,
              startY: part.y,
              parts: [part],
            });
            setFocus();
          })
          .onDismiss(setFocus);
      }
    }

    function useMove(parts: PersistentPart[]): void {
      if (floater.value) {
        dropFloater(toCoords(gridHoverPos.value));
      }
      else if (parts.length) {
        const minX = Math.min(...parts.map(part => part.x));
        const minY = Math.min(...parts.map(part => part.y));
        const startPos = toCoords(gridHoverPos.value) ?? { x: 0, y: 0 };
        makeFloater({
          ...startPos,
          moving: true,
          startX: minX,
          startY: minY,
          parts: parts.map(part => ({
            ...part,
            x: part.x - minX,
            y: part.y - minY,
          })),
        });
      }
    }

    function useCopy(parts: PersistentPart[]): void {
      if (floater.value) {
        dropFloater(toCoords(gridHoverPos.value));
      }
      else if (parts.length) {
        const minX = Math.min(...parts.map(part => part.x));
        const minY = Math.min(...parts.map(part => part.y));
        const startPos = toCoords(gridHoverPos.value) ?? { x: 0, y: 0 };
        makeFloater({
          ...startPos,
          moving: false,
          startX: minX,
          startY: minY,
          parts: parts.map(part => ({
            ...part,
            id: nanoid(),
            x: part.x - minX,
            y: part.y - minY,
          })),
        });
      }
    }

    function useRotate(parts: PersistentPart[]): void {
      if (floater.value) {
        if (floater.value.parts.length === 1) {
          const [part] = floater.value.parts;
          part.rotate = clampRotation(part.rotate + 90);
        }
      }
      else if (parts.length === 1) {
        const [part] = parts;
        savePart({ ...part, rotate: clampRotation(part.rotate + 90) });
      }
    }

    function useFlip(parts: PersistentPart[]): void {
      if (floater.value) {
        if (floater.value.parts.length === 1) {
          const [part] = floater.value.parts;
          part.flipped = !part.flipped;
        }
      }
      else if (parts.length === 1) {
        const [part] = parts;
        savePart({ ...part, flipped: !part.flipped });
      }
    }

    function useEdit(parts: PersistentPart[]): void {
      if (!floater.value && parts.length === 1) {
        configuredPartId.value = parts[0].id;
        menuDialogOpen.value = true;
      }
    }

    function useInteract(parts: PersistentPart[]): void {
      if (!floater.value && parts.length === 1) {
        const [part] = parts;
        builderStore.spec(part).interactHandler?.(part, { savePart });
      }
    }

    function useDelete(changed: PersistentPart[]): void {
      if (!floater.value && changed.length) {
        const ids = changed.map(p => p.id);
        saveParts([...parts.value.filter(p => !ids.includes(p.id))]);
        cancelSelection();
      }
    }

    function deltaMove(changed: FlowPart[], delta: XYPosition): void {
      changed.forEach(part => {
        part.x += delta.x;
        part.y += delta.y;
      });
      const ids = changed.map(v => v.id);
      saveParts([
        ...parts.value.filter(p => !ids.includes(p.id)),
        ...changed,
      ]);
    }

    ////////////////////////////////////////////////////////////////
    // Event handlers
    ////////////////////////////////////////////////////////////////

    // Return the exact position of the current event
    function d3EventPos(): XYPosition {
      const [x, y] = d3.mouse(svgContentRef.value!);
      return { x, y };
    }

    const throttledMove = throttle(
      (gridPos: XYPosition) => {
        gridHoverPos.value = gridPos;
        const coords = toCoords(gridPos);
        if (floater.value) {
          floater.value.x = coords.x;
          floater.value.y = coords.y;
        }
      },
      50,
    );

    function onSvgMouseLeave(): void {
      gridHoverPos.value = null;
    }

    function keyHandler(evt: KeyboardEvent): void {
      const key = evt.key;
      const keyDelta = moveKeys[key];
      const tool = tools.find(t => t.shortcut === key);

      if (key === 'Escape') {
        clear();
      }
      else if (keyDelta) {
        deltaMove(findActionParts(), keyDelta);
      }
      else if (evt.ctrlKey && key === 'z') {
        undo();
      }
      else if (evt.ctrlKey && key === 'y') {
        redo();
      }
      else if (tool) {
        tool.use(findActionParts());
      }
      else {
        return; // not handled - don't stop propagation
      }
      evt.stopPropagation();
    }

    watch(
      () => layoutId.value,
      (newV, oldV) => {
        if (newV !== oldV) {
          history.value = [];
          undoneHistory.value = [];
          builderStore.lastLayoutId = newV;
        }
      },
      { immediate: true },
    );

    watch(
      () => layoutTitle.value,
      title => document.title = `Brewblox | ${title}`,
      { immediate: true },
    );

    const updateFloater = throttle(
      (gridCoords: XYPosition): void => {
        if (floater.value) {
          floater.value.x = gridCoords.x - floater.value.startX;
          floater.value.y = gridCoords.y - floater.value.startY;
        }
      },
      50,
    );

    const gridDragHandler = d3.drag<SVGElement, unknown>()
      .on('start', function () {
        if (!floater.value) {
          const { x, y } = d3EventPos();
          selectArea.value = {
            startX: x,
            startY: y,
            endX: x,
            endY: y,
          };
        }
      })
      .on('drag', function () {
        const { x, y } = d3EventPos();
        if (selectArea.value) {
          selectArea.value.endX = x;
          selectArea.value.endY = y;
        }
      })
      .on('end', function () {
        if (floater.value) {
          dropFloater(toCoords(d3EventPos()));
          return;
        }

        if (!selectArea.value) {
          return;
        }

        const { altKey, shiftKey } = (d3.event.sourceEvent as MouseEvent);
        const area = unflippedArea(selectArea.value);
        const startX = area.startX / SQUARE_SIZE;
        const startY = area.startY / SQUARE_SIZE;
        const endX = area.endX / SQUARE_SIZE;
        const endY = area.endY / SQUARE_SIZE;

        const targetIds = flowParts.value
          .filter(part =>
            part.x >= startX - 1
            && part.x <= endX
            && part.y >= startY - 1
            && part.y <= endY,
          )
          .map(v => v.id);


        if (shiftKey) {
          selectedIds.value = [
            ...selectedIds.value,
            ...targetIds,
          ]
            .filter(uniqueFilter);
        }
        else if (altKey) {
          selectedIds.value = selectedIds.value
            .filter(id => !targetIds.includes(id));
        }
        else {
          selectedIds.value = targetIds;
        }

        selectArea.value = null;
      });

    const partDragHandler = d3.drag()
      .on('start', function () {
        // We're not sure yet whether this is a select or a click
        partDragStart.value = toCoords(d3EventPos());
      })
      .on('drag', function () {
        const { x, y } = toCoords(d3EventPos());
        const start = partDragStart.value;

        // We're already dragging.
        if (floater.value) {
          updateFloater({ x, y });
        }
        // The mousedown happened in a different grid square
        // We don't have a floater yet, so now we make one
        else if (start && !isEqual(start, { x, y })) {
          const partIds = selectedIds.value.length
            ? selectedIds.value
            : [this.getAttribute('part-id')];
          const parts = flowParts.value
            .filter(part => partIds.includes(part.id));

          makeFloater({
            moving: true,
            parts,
            startX: start.x,
            startY: start.y,
            x: x - start.x,
            y: y - start.y,
          });
        }

      })
      .on('end', function () {
        const coords = toCoords(d3EventPos());
        const id = this.getAttribute('part-id');
        partDragStart.value = null;

        // Stop dragging
        if (floater.value) {
          dropFloater(coords);
        }
        // This was a click event
        // Toggle selection of target part
        else if (id) {
          const idx = selectedIds.value.indexOf(id);
          selectedIds.value = idx >= 0
            ? selectedIds.value.filter(v => v !== id)
            : [...selectedIds.value, id];
        }
      });

    watch(
      [svgRef, currentMode],
      ([el, mode]) => {
        if (el) {
          d3.select(el)
            .on('mouseenter', function () {
              throttledMove(d3EventPos());
            })
            .on('mousemove', function () {
              throttledMove(d3EventPos());
            })
            .on('mouseout', function () {
              onSvgMouseLeave();
            });

          if (mode.value === 'select') {
            d3.select(el)
              .call(gridDragHandler);
          }
          else {
            d3.select(el)
              .on('.drag', null);
          }
        }
      },
      { immediate: true },
    );

    watch(
      [svgContentRef, currentMode, flowPartsRevision],
      ([el, mode]) => nextTick(() => {
        if (el) {
          const partSelect = d3.select(el)
            .selectAll<Element, any>('.flowpart');

          if (mode.value === 'select') {
            partSelect
              .call(partDragHandler);
          }
          else if (mode.value === 'zoom') {
            partSelect
              .on('.drag', null);
          }
          else if (mode.value === 'interact') {
            partSelect
              .on('.drag', null)
              .on('click', function () {
                const id = this.getAttribute('part-id');
                const part = findById(flowParts.value, id);
                if (part) {
                  builderStore.spec(part).interactHandler?.(part, { savePart });
                }
              });
          }
        }
      }),
      { immediate: true },
    );

    return {
      squares,
      pageRef,
      svgRef,
      svgContentRef,
      gridDimensions,
      resetZoom,
      keyHandler,
      selectedIds,
      checkFocus,
      leaveEditor,
      drawerOpen,
      drawerMode,
      layout,
      layoutTitle,
      selectLayout,
      setLayoutWidth,
      setLayoutHeight,
      modes,
      currentMode,
      tools,
      findActionParts,
      history,
      undoneHistory,
      undo,
      redo,
      createLayout,
      focusWarning,
      layouts,
      menuDialogOpen,
      configuredPart,
      savePart,
      removePart,
      calculateFlowParts,
      closeMenu,
      flowParts,
      flowPartsRevision,
      isBusy,
      floater,
      overlaps,
      selectArea,
      renderArea,
      pageFocused,
    };
  },
});
</script>

<template>
  <q-layout
    ref="pageRef"
    view="hHh Lpr fFf"
    class="editor-page"
    tabindex="-1"
    @keyup="keyHandler"
    @focusout="checkFocus"
  >
    <LayoutHeader @menu="drawerOpen = !drawerOpen">
      <template #title>
        {{ layoutTitle }}
      </template>
      <template #buttons>
        <q-btn
          flat
          round
          icon="mdi-arrow-left-circle"
          size="md"
          class="close-button"
          @click="leaveEditor"
        />
      </template>
    </LayoutHeader>
    <LayoutFooter />

    <q-drawer v-model="drawerOpen" class="column" elevated>
      <SidebarNavigator />

      <div class="row">
        <q-tabs v-model="drawerMode" active-color="primary" class="col-grow">
          <q-tab name="tools" label="Tools" />
          <q-tab name="layouts" label="Layouts" />
        </q-tabs>
        <BuilderActions
          :layout="layout"
          class="col-auto"
        />
      </div>

      <q-scroll-area
        class="col"
        :thumb-style="{opacity: 0.5, background: 'silver'}"
      >
        <template v-if="drawerMode === 'tools' && layout !== null">
          <q-item class="q-pb-none">
            <q-item-section class="text-bold">
              Modes
            </q-item-section>
          </q-item>

          <ActionItem
            v-for="mode in modes"
            :key="'mode-' + mode.value"
            :active="currentMode.value === mode.value"
            :icon="mode.icon"
            :label="mode.label"
            :inset-level="0.2"
            style="min-height: 0px"
            @click="currentMode = mode"
          />

          <q-item class="q-pb-none">
            <q-item-section class="text-bold">
              Tools
            </q-item-section>
          </q-item>

          <ActionItem
            v-for="tool in tools"
            :key="'tool-' + tool.value"
            :icon="tool.icon"
            :label="tool.label"
            :inset-level="0.2"
            style="min-height: 0px"
            @click="tool.use(findActionParts())"
          >
            <q-item-section side class="text-uppercase">
              {{ tool.shortcut }}
            </q-item-section>
          </ActionItem>

          <ActionItem
            :disable="!history.length"
            icon="mdi-undo"
            label="Undo"
            :inset-level="0.2"
            style="min-height: 0px"
            @click="undo"
          >
            <q-item-section side class="text-uppercase">
              ctrl-Z
            </q-item-section>
          </ActionItem>
          <ActionItem
            :disable="!undoneHistory.length"
            icon="mdi-redo"
            label="Redo"
            :inset-level="0.2"
            style="min-height: 0px"
            @click="redo"
          >
            <q-item-section side class="text-uppercase">
              ctrl-Y
            </q-item-section>
          </ActionItem>

          <q-item class="q-pb-none">
            <q-item-section class="text-bold">
              Editor
            </q-item-section>
          </q-item>

          <q-item :inset-level="0.2">
            <q-item-section>
              <q-item-label caption>
                Width
              </q-item-label>
              <q-slider
                :model-value="layout.width"
                :min="1"
                :max="50"
                label
                label-always
                @change="setLayoutWidth"
              />
            </q-item-section>
          </q-item>
          <q-item :inset-level="0.2">
            <q-item-section>
              <q-item-label caption>
                Height
              </q-item-label>
              <q-slider
                :model-value="layout.height"
                :min="1"
                :max="50"
                label
                label-always
                @change="setLayoutHeight"
              />
            </q-item-section>
          </q-item>

          <ActionItem
            :active="focusWarning"
            :inset-level="0.2"
            :icon="focusWarning
              ? 'mdi-checkbox-marked-outline'
              : 'mdi-checkbox-blank-outline'"
            label="Dim editor when focus is lost"
            @click="focusWarning = !focusWarning"
          />
        </template>

        <template v-if="drawerMode === 'layouts'">
          <ActionItem
            v-for="lo in layouts"
            :key="lo.id"
            :label="lo.title"
            :active="layout && lo.id === layout.id"
            icon="mdi-view-dashboard-outline"
            @click="selectLayout(lo.id)"
          />
        </template>

        <template v-if="layouts.length === 0">
          <div class="darkish q-pa-md">
            It's empty in here.
            Create a layout to get started.
          </div>
        </template>
      </q-scroll-area>
    </q-drawer>

    <BuilderPartMenu
      v-if="menuDialogOpen"
      :part="configuredPart"
      :rev="flowPartsRevision"
      @update:part="savePart"
      @remove:part="removePart"
      @dirty="calculateFlowParts"
      @hide="closeMenu"
    />

    <q-page-container style="overflow: hidden">
      <q-page class="page-height q-pa-md">
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
              style="color:white"
              @update:model-value="v => v && selectLayout(v.id)"
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
        <svg
          v-else
          ref="svgRef"
          class="fit"
        >
          <g ref="svgContentRef">
            <foreignObject
              class="grid-background"
              v-bind="gridDimensions"
            />
            <!-- Coordinate numbers -->
            <text
              v-for="x in layout.width"
              :key="`edge-x-${x}`"
              :x="squares(x-1)+20"
              :y="8"
              fill="white"
              class="grid-square-text"
            >{{ x-1 }}</text>
            <text
              v-for="y in layout.height"
              :key="`edge-y-${y}`"
              :x="0"
              :y="squares(y-1)+28"
              fill="white"
              class="grid-square-text"
            >{{ y-1 }}</text>
            <!-- All parts, hidden if selected or floating -->
            <g
              v-for="part in flowParts"
              v-show="!isBusy(part)"
              :key="`${flowPartsRevision}-${part.id}`"
              :part-id="part.id"
              :transform="`translate(${squares(part.x)}, ${squares(part.y)})`"
              :class="{
                pointer: currentMode.cursor(part),
                [part.type]: true,
                flowpart: true
              }"
            >
              <PartWrapper
                :part="part"
                show-hover
                :selected="selectedIds.includes(part.id)"
                @update:part="savePart"
                @dirty="calculateFlowParts"
              />
            </g>
            <!-- Floating parts -->
            <g v-if="floater" :transform="`translate(${squares(floater.x)}, ${squares(floater.y)})`">
              <g
                v-for="part in floater.parts"
                :key="`floating-${part.id}`"
                :transform="`translate(${squares(part.x)}, ${squares(part.y)})`"
                :class="{ pointer: currentMode.cursor(part), [part.type]: true }"
              >
                <PartWrapper :part="part" selected />
              </g>
            </g>
            <!-- Overlap indicators -->
            <g
              v-for="([coord, val], idx) in overlaps"
              :key="idx"
              :transform="`translate(${squares(coord.x) + 40}, ${squares(coord.y) + 4})`"
            >
              <circle r="8" fill="dodgerblue" />
              <text
                y="4"
                text-anchor="middle"
                fill="white"
                class="grid-square-text"
              >{{ val }}</text>
            </g>
            <!-- Selection area -->
            <rect
              v-if="selectArea"
              v-bind="renderArea(selectArea)"
              stroke="white"
              fill="dodgerblue"
              opacity="0.3"
              style="pointer-events: none;"
            />
          </g>
        </svg>
        <q-btn
          unelevated
          class="absolute-bottom-right q-ma-lg"
          color="secondary"
          icon="mdi-stretch-to-page-outline"
          @click="resetZoom"
        >
          <q-tooltip>
            Fit to screen
          </q-tooltip>
        </q-btn>
        <div
          v-if="layout && !pageFocused && focusWarning"
          class="unfocus-overlay"
          @click.stop="checkFocus"
        >
          <transition appear name="fade">
            <div class="text-h5 text-white absolute-center q-pa-lg resume-message">
              Click to resume editing
            </div>
          </transition>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="sass" scoped>
@import "./grid.sass"

.editor-page
  outline: none

.q-page-container
  max-height: 100vh
  max-width: 100vw

.unfocus-overlay
  position: fixed
  top: 0
  left: 0
  height: 100vh
  width: 100vw
  background-color: rgba(0, 0, 0, 0.5)
  transition: 1s

.resume-message
  border-radius: 40px
  border: 2px solid silver

.fade-enter-active
  transition: opacity 4s ease

.fade-enter
  opacity: 0

  &-to
    opacity: 1
</style>
