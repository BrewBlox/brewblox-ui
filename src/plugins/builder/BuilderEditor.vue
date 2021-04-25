<script lang="ts">
import { nanoid } from 'nanoid';
import { debounce, QLayout, useQuasar } from 'quasar';
import { computed, defineComponent, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useGlobals } from '@/composables';
import { systemStore } from '@/store/system';
import { Coordinates } from '@/utils/coordinates';
import { createDialog } from '@/utils/dialog';
import { clampRotation, deepCopy, filterById, spliceById } from '@/utils/functional';

import BuilderCatalog from './BuilderCatalog.vue';
import BuilderPartMenu from './BuilderPartMenu.vue';
import { calculateNormalizedFlows } from './calculateFlows';
import { SQUARE_SIZE } from './const';
import { builderStore } from './store';
import { BuilderLayout, ClickEvent, FlowPart, PartUpdater, PersistentPart, Rect } from './types';
import { asPersistentPart, asStatePart, rectContains, squares, vivifyParts } from './utils';

interface Floater extends XYPosition {
  moving: boolean;
  parts: PersistentPart[];
}

interface SelectArea extends XYPosition {
  width: number;
  height: number;
}

interface EditorAction {
  label: string;
  value: string;
  icon: string;
}

interface ActionMode extends EditorAction {
  cursor: (part: PersistentPart) => boolean;
  onClick?: (evt: ClickEvent, part: FlowPart | null) => void;
  onPan?: (args: PanArguments, part: FlowPart | null) => void;
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
  setup() {
    const { dense } = useGlobals.setup();
    const { localStorage } = useQuasar();
    const router = useRouter();

    const layoutId = ref<string | null>(null);

    const flowParts = ref<FlowPart[]>([]);
    const flowPartsRev = ref<string>('');
    const history = ref<string[]>([]);
    const undoneHistory = ref<string[]>([]);

    const drawerContent = ref<'tools' | 'layouts'>('tools');
    const menuDialogOpen = ref<boolean>(false);
    const focusWarning = ref<boolean>(true);

    const selectedTime = ref<number>(0);
    const selectArea = ref<SelectArea | null>(null);
    const selectedParts = ref<FlowPart[]>([]);
    const hoverPos = ref<XYPosition | null>(null);
    const pageFocused = ref<boolean>(true);

    const floater = ref<Floater | null>(null);
    const configuredPartId = ref<string | null>(null);

    const updater: PartUpdater = { updatePart: savePart };

    const gridRef = ref<SVGElement>();
    const pageRef = ref<QLayout>();

    const _drawerOpen = ref<boolean>(localStorage.getItem('drawer') ?? !dense.value);
    const drawerOpen = computed<boolean>({
      get: () => _drawerOpen.value,
      set: v => {
        _drawerOpen.value = v;
        localStorage.set('drawer', v);
      },
    });

    const modes: ActionMode[] = [
      {
        label: 'Select',
        value: 'select',
        icon: 'mdi-select-drag',
        cursor: part => !!part,
        onPan: selectPanHandler,
        onClick: selectClickHandler,
      },
      {
        label: 'Interact',
        value: 'interact',
        icon: 'mdi-cursor-default',
        cursor: part => !!part && !!builderStore.spec(part).interactHandler,
        onClick: interactClickHandler,
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

    const layout = computed<BuilderLayout | null>(
      () => builderStore.layoutById(layoutId.value),
    );

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

    const parts = computed<PersistentPart[]>(
      () => layout.value !== null
        ? vivifyParts(layout.value.parts)
        : [],
    );

    const configuredPart = computed<FlowPart | null>(
      () => flowParts.value.find(p => p.id === configuredPartId.value) ?? null,
    );

    const overlaps = computed<[Coordinates, number][]>(
      () => {
        const counts: Mapped<number> = {};
        for (const part of parts.value) {
          const key = new Coordinates([part.x, part.y, 0]).toString();
          counts[key] = (counts[key] || 0) + 1;
        }
        return Object.entries(counts)
          .filter(([, v]) => v > 1)
          .map(([k, v]) => [new Coordinates(k), v] as [Coordinates, number]);
      },
    );

    const currentMode = computed<ActionMode>({
      get: () => {
        const toolId = builderStore.editorMode;
        return modes.find(tool => tool.value === toolId) ?? modes[0];
      },
      set: tool => builderStore.editorMode = tool.value,
    });

    const routeId = computed<string | null>(
      () => {
        const route = router.currentRoute.value;
        return route.path.startsWith('/builder')
          ? route.params.id as string || null
          : null;
      },
    );

    function selectLayout(id: string | null): void {
      layoutId.value = id
        ?? routeId.value
        ?? builderStore.lastLayoutId
        ?? builderStore.layoutIds[0]
        ?? null;

      const route = layoutId.value ? `/builder/${layoutId.value}` : '/builder';
      router.replace(route).catch(() => { });
      builderStore.lastLayoutId = layoutId.value;
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


    async function saveLayout(saved: BuilderLayout | null = layout.value): Promise<void> {
      if (saved === null) {
        return;
      }
      else if (saved.id) {
        await builderStore.saveLayout(saved);
      } else {
        const id = nanoid();
        await builderStore.createLayout({ ...saved, id });
        selectLayout(id);
      }
    }

    async function saveParts(parts: PersistentPart[], saveHistory = true): Promise<void> {
      if (!layout.value) { return; }

      if (saveHistory) {
        const stored = builderStore.layoutById(layout.value.id);
        if (stored) {
          history.value.push(JSON.stringify(stored.parts));
          undoneHistory.value = [];
        }
      }

      // first set local value, to avoid jitters caused by the period between action and VueX refresh
      layout.value.parts = parts.map(asPersistentPart);
      calculate();
      await saveLayout();
    }

    const debouncedSaveParts = debounce(saveParts, 500);

    async function savePart(part: PersistentPart): Promise<void> {
      await saveParts(spliceById(parts.value, part));
    }

    async function removePart(part: PersistentPart): Promise<void> {
      await saveParts(filterById(parts.value, part));
    }

    async function undo(): Promise<void> {
      if (layout.value && history.value.length > 0) {
        cancelSelection();

        const current = builderStore.layoutById(layout.value.id);
        if (current) {
          const state = JSON.stringify(current.parts);
          const parts = JSON.parse(history.value.pop()!);
          await saveParts(parts, false);
          undoneHistory.value.push(state);
        }
      }
    }

    async function redo(): Promise<void> {
      if (layout.value && undoneHistory.value.length > 0) {
        cancelSelection();

        const current = builderStore.layoutById(layout.value.id);
        if (current) {
          const state = JSON.stringify(current.parts);
          const parts = JSON.parse(undoneHistory.value.pop()!);
          await saveParts(parts, false);
          history.value.push(state);
        }
      }
    }

    function gridRect(): Rect {
      // Edge (pre-chromium) does not return x/y values
      // We can infer them from left/top
      const { left, right, top, bottom } = gridRef.value!.getBoundingClientRect();
      return { left, right, top, bottom, x: left, y: top };
    }

    function isBusy(part: PersistentPart): boolean {
      return floater.value?.parts.some(p => p.id === part.id)
        || selectedParts.value.some(p => p.id === part.id);
    }

    function updateFlowParts(parts: FlowPart[]): void {
      flowParts.value = parts;
      flowPartsRev.value = nanoid(5);
      if (selectedParts.value.length > 0) {
        const selectedIds = selectedParts.value.map(p => p.id);
        selectedParts.value = flowParts.value
          .filter(p => selectedIds.includes(p.id))
          .map(deepCopy);
      }
    }

    const calculate = debounce(
      async () => {
        await nextTick();
        const source = deepCopy(parts.value);
        updateFlowParts(calculateNormalizedFlows(source.map(asStatePart)));
      },
      150,
      true,
    );

    function clear(): void {
      if (floater.value) {
        floater.value = null;
      }
      else if (selectedParts.value.length) {
        selectedParts.value = [];
      }
    }

    function dropFloater(pos: XYPosition | null, isGridPos: boolean): void {
      if (!floater.value) { return; }

      pos = isGridPos ? pos : findGridSquare(pos);
      if (pos) {
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
      selectedParts.value = [];
      floater.value = null;
    }

    function findGridSquare(rawPos: XYPosition | null): XYPosition | null {
      if (rawPos === null) { return null; }
      const grid = gridRect();
      let { x, y } = rawPos;

      // Compensate for page scrolling
      x -= window.pageXOffset;
      y -= window.pageYOffset;

      return rectContains(grid, x, y)
        ? {
          x: Math.floor((x - grid.x) / SQUARE_SIZE),
          y: Math.floor((y - grid.y) / SQUARE_SIZE),
        }
        : null;
    }

    function findClickSquare(evt: ClickEvent): XYPosition | null {
      const touch = (evt instanceof MouseEvent) ? evt : evt.touches[0];
      return findGridSquare({ x: touch.clientX, y: touch.clientY });
    }

    function findPartAtPos(pos: XYPosition | null, isGridPos: boolean): FlowPart | null {
      pos = isGridPos ? pos : findGridSquare(pos);
      if (!pos) { return null; }
      // iterate right to left to match rendering order
      // when items overlap, the later item is rendered on top
      for (let idx = flowParts.value.length - 1; idx >= 0; idx--) {
        const part = flowParts.value[idx];
        if (pos.x >= part.x
          && pos.x < part.x + part.size[0]
          && pos.y >= part.y
          && pos.y < part.y + part.size[1]) {
          return part;
        }
      }
      return null;
    }

    function findActionParts(): FlowPart[] {
      if (selectedParts.value.length) {
        return selectedParts.value;
      }
      const hovered = findPartAtPos(hoverPos.value, false);
      return hovered
        ? [hovered]
        : [];
    }

    function unflippedArea(area: SelectArea): SelectArea {
      return {
        x: area.width >= 0 ? area.x : area.x + area.width,
        y: area.height >= 0 ? area.y : area.y + area.height,
        width: Math.abs(area.width),
        height: Math.abs(area.height),
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

    function selectPanHandler(args: PanArguments): void {
      if (args.isFirst) {
        const grid = gridRect();
        selectArea.value = {
          x: args.position.left - grid.x,
          y: args.position.top - grid.y,
          width: 0,
          height: 0,
        };
      }

      if (selectArea.value) {
        const { x, y } = args.delta;
        selectArea.value.width += x;
        selectArea.value.height += y;
      }

      if (args.isFinal && selectArea.value) {
        const { x, y, width, height } = unflippedArea(selectArea.value);
        const startX = x / SQUARE_SIZE;
        const startY = y / SQUARE_SIZE;
        const endX = startX + (width / SQUARE_SIZE);
        const endY = startY + (height / SQUARE_SIZE);

        const ids = selectedParts.value.map(part => part.id);

        selectedParts.value.push(
          ...flowParts.value
            .filter(part =>
              !ids.includes(part.id)
              && part.x >= startX - 1
              && part.x <= endX
              && part.y >= startY - 1
              && part.y <= endY)
            .map(deepCopy));

        selectArea.value = null;
        selectedTime.value = new Date().getTime();
      }
    }

    function selectClickHandler(evt: ClickEvent, part: FlowPart | null): void {
      if (new Date().getTime() - selectedTime.value < 500) {
        // The mouseup at the end of a pan also generates a click event - skip this
        return;
      }

      if (!part) {
        cancelSelection();
        return;
      }

      const selectedIdx = selectedParts.value.findIndex(p => p.id === part.id);
      if (selectedIdx >= 0) {
        selectedParts.value.splice(selectedIdx, 1);
      } else {
        selectedParts.value.push(deepCopy(part));
      }
    }

    function cancelSelection(): void {
      selectedTime.value = 0;
      selectArea.value = null;
      selectedParts.value = [];
    }

    function interactClickHandler(evt: ClickEvent, part: FlowPart | null): void {
      if (part) {
        builderStore.spec(part).interactHandler?.(part, updater);
      }
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
            floater.value = {
              moving: false,
              x: 0,
              y: 0,
              parts: [part],
            };
            setFocus();
          })
          .onDismiss(setFocus);
      }
    }

    function useMove(parts: PersistentPart[]): void {
      if (floater.value) {
        dropFloater(hoverPos.value, false);
      }
      else if (parts.length) {
        const minX = Math.min(...parts.map(part => part.x));
        const minY = Math.min(...parts.map(part => part.y));
        const startPos = hoverPos.value || { x: 0, y: 0 };
        floater.value = {
          ...startPos,
          moving: true,
          parts: parts.map(part => ({
            ...deepCopy(part),
            x: part.x - minX,
            y: part.y - minY,
          })),
        };
      }
    }

    function useCopy(parts: PersistentPart[]): void {
      if (floater.value) {
        dropFloater(hoverPos.value, false);
      }
      else if (parts.length) {
        const minX = Math.min(...parts.map(part => part.x));
        const minY = Math.min(...parts.map(part => part.y));
        const startPos = hoverPos.value ?? { x: 0, y: 0 };
        floater.value = {
          ...startPos,
          moving: false,
          parts: parts.map(part => ({
            ...deepCopy(part),
            id: nanoid(),
            x: part.x - minX,
            y: part.y - minY,
          })),
        };
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
        builderStore.spec(part).interactHandler?.(part, updater);
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
      debouncedSaveParts([
        ...parts.value.filter(p => !ids.includes(p.id)),
        ...changed,
      ]);
    }

    ////////////////////////////////////////////////////////////////
    // Event handlers
    ////////////////////////////////////////////////////////////////

    function onGridMove(evt: MouseEvent): void {
      hoverPos.value = { x: evt.pageX, y: evt.pageY };
      if (floater.value) {
        const pos = findGridSquare(hoverPos.value);
        if (pos) {
          floater.value.x = pos.x;
          floater.value.y = pos.y;
        }
      }
    }

    function onGridLeave(): void {
      hoverPos.value = null;
    }

    function clickHandler(evt: ClickEvent, part: FlowPart | null): void {
      if (floater.value) {
        dropFloater(findClickSquare(evt), true);
      }
      else if (currentMode.value.onClick) {
        currentMode.value.onClick(evt, part);
      }
      evt.stopPropagation();
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
      else if (evt.ctrlKey) {
        if (key === 'z') { undo(); }
        if (key === 'y') { redo(); }
      }
      else if (tool) {
        tool.use(findActionParts());
      }
      else {
        return; // not handled - don't stop propagation
      }
      evt.stopPropagation();
    }

    function panHandler(args: PanArguments, part: FlowPart | null): void {
      if (currentMode.value.onPan) {
        currentMode.value.onPan(args, part);
      }
      args.evt.stopPropagation();
    }

    watch(
      () => layoutId.value,
      (newV, oldV) => {
        if (newV !== oldV) {
          history.value = [];
          undoneHistory.value = [];
        }
      },
    );

    watch(
      () => layout.value,
      () => calculate(),
    );

    watch(
      () => layoutTitle.value,
      title => document.title = `Brewblox | ${title}`,
      { immediate: true },
    );

    watch(
      () => systemStore.started,
      (started) => {
        if (started) {
          selectLayout(null);
          nextTick(() => setFocus());
        }
      },
      { immediate: true },
    );

    return {
      squares,
      pageRef,
      gridRef,
      keyHandler,
      checkFocus,
      leaveEditor,
      drawerOpen,
      drawerContent,
      layout,
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
      saveLayout,
      focusWarning,
      layouts,
      menuDialogOpen,
      configuredPart,
      savePart,
      removePart,
      calculate,
      closeMenu,
      clickHandler,
      onGridMove,
      onGridLeave,
      panHandler,
      flowParts,
      flowPartsRev,
      isBusy,
      floater,
      selectedParts,
      overlaps,
      selectArea,
      unflippedArea,
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
        Brewery Builder
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
        <q-tabs v-model="drawerContent" active-color="primary" class="col-grow">
          <q-tab name="tools" label="Tools" />
          <q-tab name="layouts" label="Layouts" />
        </q-tabs>
        <BuilderActions
          :layout="layout"
          class="col-auto"
          @selected="selectLayout"
        />
      </div>

      <q-scroll-area
        class="col"
        :thumb-style="{opacity: 0.5, background: 'silver'}"
      >
        <template v-if="drawerContent === 'tools' && layout !== null">
          <q-item class="q-pb-none">
            <q-item-section class="text-bold">
              Mouse actions
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

        <template v-if="drawerContent === 'layouts'">
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
      :rev="flowPartsRev"
      @update:part="savePart"
      @remove:part="removePart"
      @dirty="calculate"
      @hide="closeMenu"
    />

    <q-page-container style="overflow: hidden">
      <q-page class="row no-wrap justify-center q-pa-md">
        <PageError v-if="!layout">
          No layout selected
        </PageError>
        <div v-else class="col-auto column no-wrap">
          <div
            v-touch-pan.stop.prevent.mouse.mouseStop.mousePrevent="v => panHandler(v, null)"
            :style="{
              width: `${squares(layout.width)}px`,
              height: `${squares(layout.height)}px`,
            }"
            class="q-mb-md"
          >
            <svg
              ref="gridRef"
              class="fit grid-editable"
              @click="evt => clickHandler(evt, null)"
              @mouseenter="onGridMove"
              @mousemove="onGridMove"
              @mouseleave="onGridLeave"
            >
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
                :key="`${flowPartsRev}-${part.id}`"
                v-touch-pan.stop.prevent.mouse.mouseStop.mousePrevent="v => panHandler(v, part)"
                :transform="`translate(${squares(part.x)}, ${squares(part.y)})`"
                :class="{ pointer: currentMode.cursor(part), [part.type]: true }"
                @click.stop="v => clickHandler(v, part)"
              >
                <PartWrapper
                  :part="part"
                  show-hover
                  @update:part="savePart"
                  @dirty="calculate"
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
              <!-- Selected parts -->
              <template v-if="!floater || !floater.moving">
                <g
                  v-for="part in selectedParts"
                  :key="`selected-${part.id}`"
                  :transform="`translate(${squares(part.x)}, ${squares(part.y)})`"
                  :class="{ pointer: currentMode.cursor(part), [part.type]: true }"
                  @click.stop="v => clickHandler(v, part)"
                >
                  <PartWrapper :part="part" selected />
                </g>
              </template>
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
                v-bind="unflippedArea(selectArea)"
                stroke="white"
                fill="dodgerblue"
                opacity="0.3"
                style="pointer-events: none;"
              />
            </svg>
          </div>
        </div>
        <div
          v-if="!pageFocused && focusWarning"
          class="unfocus-overlay"
          @click.stop="checkFocus"
        >
          <transition appear name="fade">
            <div class="text-h5 text-white fixed-center q-pa-lg resume-message">
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
