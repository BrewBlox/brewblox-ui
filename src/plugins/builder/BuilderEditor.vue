<script lang="ts">
import * as d3 from 'd3';
import isEqual from 'lodash/isEqual';
import throttle from 'lodash/throttle';
import { nanoid } from 'nanoid';
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
import { systemStore } from '@/store/system';
import { rotatedSize } from '@/utils/coordinates';
import { createDialog } from '@/utils/dialog';
import { clampRotation, deepCopy, filterById, spliceById, uniqueFilter } from '@/utils/functional';

import BuilderCatalog from './BuilderCatalog.vue';
import BuilderPartMenu from './BuilderPartMenu.vue';
import { useDragSelect, useFlowParts, useSvgZoom, UseSvgZoomDimensions } from './composables';
import { BuilderMode, BuilderModeName, builderModes, BuilderToolName, builderTools, SQUARE_SIZE } from './const';
import { builderStore } from './store';
import { BuilderLayout, FlowPart, PersistentPart } from './types';
import { asStatePart, squares, startAddLayout, startChangeLayoutTitle } from './utils';

type SVGSelection = d3.Selection<SVGElement, unknown, null, undefined>

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
    const router = useRouter();

    const history = ref<string[]>([]);
    const undoneHistory = ref<string[]>([]);

    const menuDialogOpen = ref<boolean>(false);

    const activeMode = ref<BuilderModeName>('select');

    const gridHoverPos = ref<XYPosition | null>(null);
    const partDragStart = ref<XYPosition | null>(null);

    const selectedIds = ref<string[]>([]);
    const configuredId = ref<string | null>(null);
    const floater = ref<UnwrapRef<Floater> | null>(null);

    const focusRef = ref<HTMLElement>();
    const hasFocus = ref<boolean>(true);

    function checkFocus(): void {
      nextTick(() => {
        hasFocus.value = (focusRef.value?.matches(':focus-within') === true);
      });
    }

    function setFocus(): void {
      focusRef.value?.focus();
      checkFocus();
    }

    const startupDone = computed<boolean>(
      () => systemStore.startupDone,
    );

    const focusWarningEnabled = computed<boolean>({
      get: () => builderStore.focusWarningEnabled,
      set: v => builderStore.focusWarningEnabled = v,
    });

    const layouts = computed<BuilderLayout[]>(
      () => builderStore.layouts,
    );

    const layoutId = computed<string | null>(
      () => props.routeId || null,
    );

    const {
      layout,
      parts,
      flowParts,
      flowPartsRevision,
      calculateFlowParts,
    } = useFlowParts.setup(layoutId);

    const layoutTitle = computed<string>(
      () => layout.value?.title ?? 'Builder editor',
    );

    function editTitle(): void {
      startChangeLayoutTitle(layout.value);
    }

    const gridDimensions = computed<UseSvgZoomDimensions>(
      () => ({
        width: squares(layout.value?.width ?? 10),
        height: squares(layout.value?.height ?? 10),
      }),
    );

    const configuredPart = computed<FlowPart | null>(
      () => flowParts.value.find(p => p.id === configuredId.value) ?? null,
    );

    const modeClass = computed<BuilderMode['class']>(
      () => builderModes.find(v => v.value === activeMode.value)?.class ?? (() => ''),
    );

    const dragEnabled = computed<boolean>(
      () => activeMode.value === 'pan',
    );

    const {
      svgRef,
      svgContentRef,
      resetZoom,
    } = useSvgZoom.setup(gridDimensions, { dragEnabled });

    const {
      selectAreaRef,
      startDragSelect,
      updateDragSelect,
      stopDragSelect,
      makeSelectAreaFilter,
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
      if (history.value.length > 0) {
        cancelSelection();
        undoneHistory.value.push(JSON.stringify(parts.value));
        parts.value = JSON.parse(history.value.pop()!);
      }
    }

    function redo(): void {
      if (undoneHistory.value.length > 0) {
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

    function isFloating(part: FlowPart): boolean {
      return floater.value?.parts.some(p => p.id === part.id) === true;
    }

    function clear(): void {
      floater.value = null;
      selectedIds.value = [];
    }

    function makeFloater(source: Floater): void {
      floater.value = deepCopy(source);
    }

    const moveFloater = throttle(
      ({ x, y }: XYPosition): void => {
        if (floater.value) {
          floater.value = { ...floater.value, x, y };
        }
      },
      50,
    );

    function dropFloater(coords: XYPosition | null): void {
      if (!floater.value) { return; }
      const source = floater.value;

      if (coords) {
        const ids: string[] = [];

        floater.value.parts
          .forEach(part => {
            ids.push(part.id);
            part.x += coords.x;
            part.y += coords.y;
          });

        saveParts([
          ...parts.value.filter(p => !ids.includes(p.id)),
          ...source.parts,
        ]);
      }

      floater.value = null;
    }

    function findPartAtCoords(coords: XYPosition | null): FlowPart | null {
      // iterate right to left to match rendering order
      // when items overlap, the later item is rendered on top
      if (coords) {
        for (let idx = flowParts.value.length - 1; idx >= 0; idx--) {
          const part = flowParts.value[idx];
          const [sizeX, sizeY] = rotatedSize(part.rotate, part.size);
          if (coords.x >= part.x
            && coords.x < part.x + sizeX
            && coords.y >= part.y
            && coords.y < part.y + sizeY) {
            return deepCopy(part);
          }
        }
      }
      return null;
    }

    function findActiveParts(): FlowPart[] {
      if (selectedIds.value.length) {
        return deepCopy(flowParts.value.filter(v => selectedIds.value.includes(v.id)));
      }
      const hovered = findPartAtCoords(toCoords(gridHoverPos.value));
      return hovered
        ? [hovered]
        : [];
    }

    function closeMenu(): void {
      menuDialogOpen.value = false;
      nextTick(setFocus);
    }

    function leaveEditor(): void {
      router.back();
    }

    function cancelSelection(): void {
      stopDragSelect();
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
              x: 0,
              y: 0,
              parts: [{ ...asStatePart(part), flows: {} }],
            });
            setFocus();
          })
          .onDismiss(setFocus);
      }
    }

    function useMove(activeParts: FlowPart[]): void {
      if (floater.value) {
        dropFloater(toCoords(gridHoverPos.value));
      }
      else if (activeParts.length) {
        // gridHoverPos will not be set if the tool is used by clicking on the tools menu
        const { x, y } = toCoords(gridHoverPos.value) ?? { x: 0, y: 0 };
        const minX = Math.min(...activeParts.map(part => part.x));
        const minY = Math.min(...activeParts.map(part => part.y));
        const parts = activeParts.map(part => ({
          ...part,
          x: part.x - minX,
          y: part.y - minY,
        }));

        makeFloater({ x, y, parts });
      }
    }

    function useCopy(activeParts: FlowPart[]): void {
      if (floater.value) {
        dropFloater(toCoords(gridHoverPos.value));
      }
      else if (activeParts.length) {
        // gridHoverPos will not be set if the tool is used by clicking on the tools menu
        const { x, y } = toCoords(gridHoverPos.value) ?? { x: 0, y: 0 };
        const minX = Math.min(...activeParts.map(part => part.x));
        const minY = Math.min(...activeParts.map(part => part.y));
        const parts = activeParts.map(part => ({
          ...part,
          id: nanoid(),
          x: part.x - minX,
          y: part.y - minY,
        }));
        makeFloater({ x, y, parts });
      }
    }

    function useRotate(activeParts: FlowPart[]): void {
      if (floater.value) {
        if (floater.value.parts.length === 1) {
          const [part] = floater.value.parts;
          part.rotate = clampRotation(part.rotate + 90);
        }
      }
      else if (activeParts.length === 1) {
        const [part] = activeParts;
        savePart({ ...part, rotate: clampRotation(part.rotate + 90) });
      }
    }

    function useFlip(activeParts: FlowPart[]): void {
      if (floater.value) {
        if (floater.value.parts.length === 1) {
          const [part] = floater.value.parts;
          part.flipped = !part.flipped;
        }
      }
      else if (activeParts.length === 1) {
        const [part] = activeParts;
        savePart({ ...part, flipped: !part.flipped });
      }
    }

    function useEdit(activeParts: FlowPart[]): void {
      if (!floater.value && activeParts.length === 1) {
        configuredId.value = activeParts[0].id;
        menuDialogOpen.value = true;
      }
    }

    function useInteract(activeParts: FlowPart[]): void {
      if (!floater.value && activeParts.length === 1) {
        const [part] = activeParts;
        builderStore.spec(part).interactHandler?.(part, { savePart });
      }
    }

    function useDelete(activeParts: FlowPart[]): void {
      if (!floater.value && activeParts.length) {
        const ids = activeParts.map(p => p.id);
        saveParts([...parts.value.filter(p => !ids.includes(p.id))]);
        cancelSelection();
      }
    }

    function deltaMove(activeParts: FlowPart[], delta: XYPosition): void {
      activeParts.forEach(part => {
        part.x += delta.x;
        part.y += delta.y;
      });
      const ids = activeParts.map(v => v.id);
      saveParts([
        ...parts.value.filter(p => !ids.includes(p.id)),
        ...activeParts,
      ]);
    }

    const builderToolActions: Record<BuilderToolName, (parts: FlowPart[]) => unknown> = {
      add: useAdd,
      move: useMove,
      copy: useCopy,
      rotate: useRotate,
      flip: useFlip,
      edit: useEdit,
      interact: useInteract,
      delete: useDelete,
    };

    function useTool(name: BuilderToolName): void {
      const action = builderToolActions[name];
      if (action) {
        action(findActiveParts());
        setFocus();
      }
    }

    ////////////////////////////////////////////////////////////////
    // Event handlers
    ////////////////////////////////////////////////////////////////

    // Return the exact position of the current event
    function d3EventPos(): XYPosition {
      const [x, y] = d3.mouse(svgContentRef.value!);
      return { x, y };
    }

    function gridHoverHandler(selection: SVGSelection): SVGSelection {
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
      return selection
        .on('mouseenter', function () {
          throttledMove(d3EventPos());
        })
        .on('mousemove', function () {
          throttledMove(d3EventPos());
        })
        .on('mouseout', function () {
          gridHoverPos.value = null;
        });
    }

    const gridDragHandler = d3.drag<SVGElement, unknown>()
      .on('start', function () {
        if (!floater.value) {
          const { x, y } = d3EventPos();
          startDragSelect({
            startX: x,
            startY: y,
            endX: x,
            endY: y,
          });
        }
      })
      .on('drag', function () {
        const { x, y } = d3EventPos();
        updateDragSelect(x, y);
      })
      .on('end', function () {
        if (floater.value) {
          dropFloater(toCoords(d3EventPos()));
          return;
        }

        const { altKey, shiftKey } = (d3.event.sourceEvent as MouseEvent);

        const sourceIds = deepCopy(selectedIds.value);
        const targetIds = flowParts.value
          .filter(makeSelectAreaFilter())
          .map(v => v.id);

        if (shiftKey) {
          selectedIds.value = [
            ...sourceIds,
            ...targetIds,
          ]
            .filter(uniqueFilter);
        }
        else if (altKey) {
          selectedIds.value = sourceIds
            .filter(id => !targetIds.includes(id));
        }
        else {
          selectedIds.value = [...targetIds];
        }

        stopDragSelect();
      });

    const partDragHandler = d3.drag()
      .on('start', function () {
        // We're not sure yet whether this is a drag or a click
        // The action becomes a drag once the mouse leaves the square
        // The action is a click if the mouseup event is in the same square
        partDragStart.value = toCoords(d3EventPos());
      })
      .on('drag', function () {
        const { x, y } = toCoords(d3EventPos());
        const start = partDragStart.value;

        // We're already dragging.
        if (floater.value) {
          moveFloater({ x, y });
        }
        // Check if the drag event has left the initial square
        // Create a floater when this happens
        else if (start && !isEqual(start, { x, y })) {
          const partIds = selectedIds.value.length
            ? selectedIds.value
            : [this.getAttribute('part-id')];
          const parts = flowParts.value
            .filter(part => partIds.includes(part.id))
            .map(part => ({
              ...part,
              x: part.x - start.x,
              y: part.y - start.y,
            }));

          makeFloater({ x, y, parts });
        }
      })
      .on('end', function () {
        const coords = toCoords(d3EventPos());
        const id = this.getAttribute('part-id');
        partDragStart.value = null;

        // This was a drag event
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

    function keyHandler(evt: KeyboardEvent): void {
      const key = evt.key;
      const keyDelta = moveKeys[key];
      const tool = builderTools.find(v => v.shortcut === key);

      if (key === 'Escape') {
        clear();
      }
      else if (key === 'Delete') {
        useTool('delete');
      }
      else if (keyDelta) {
        deltaMove(findActiveParts(), keyDelta);
      }
      else if (evt.ctrlKey && key === 'z') {
        undo();
      }
      else if (evt.ctrlKey && key === 'y') {
        redo();
      }
      else if (tool) {
        useTool(tool.value);
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
          nextTick(() => setFocus());
        }
      },
      { immediate: true },
    );

    watch(
      () => layoutTitle.value,
      title => document.title = `Brewblox | ${title}`,
      { immediate: true },
    );

    watch(
      [svgRef, activeMode],
      ([el, mode]) => {
        if (el) {
          d3.select(el)
            .call(gridHoverHandler);

          if (mode === 'select') {
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
      [svgContentRef, activeMode, flowPartsRevision],
      ([el, mode]) => nextTick(() => {
        if (el) {
          const partSelection = d3.select(el)
            .selectAll<Element, any>('.flowpart');

          if (mode === 'select') {
            partSelection
              .call(partDragHandler);
          }
          else if (mode === 'pan') {
            partSelection
              .on('.drag', null);
          }
          else if (mode === 'interact') {
            partSelection
              .on('.drag', null)
              .on('click', function () {
                const id = this.getAttribute('part-id');
                useInteract(flowParts.value.filter(v => v.id === id));
              });
          }
        }
      }),
      { immediate: true },
    );

    return {
      squares,

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
      modeClass,

      startupDone,
      activeMode,
      layouts,
      layoutId,
      layout,
      layoutTitle,
      editTitle,
      selectLayout,
      createLayout,
      savePart,
      removePart,

      menuDialogOpen,
      configuredPart,
      closeMenu,

      keyHandler,
      useTool,
      leaveEditor,

      history,
      undoneHistory,
      undo,
      redo,
    };
  },
});
</script>

<template>
  <q-page
    class="page-height"
    @keyup="keyHandler"
  >
    <BuilderPartMenu
      v-if="menuDialogOpen"
      :part="configuredPart"
      :rev="flowPartsRevision"
      @update:part="savePart"
      @remove:part="removePart"
      @dirty="calculateFlowParts"
      @hide="closeMenu"
    />

    <TitleTeleport>
      <span @click="editTitle">{{ layoutTitle }}</span>
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
        label="Layout actions"
      >
        <template #menus>
          <LayoutActions :layout="layout" />
        </template>
        <template #actions>
          <ToggleAction
            v-model="focusWarningEnabled"
            label="Show focus warning"
          />
          <ActionItem
            label="Reset zoom"
            icon="mdi-stretch-to-page-outline"
            @click="resetZoom"
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
      <div>
        Waiting for datastore...
      </div>
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
      >
        <g ref="svgContentRef">
          <EditorBackground :width="layout.width" :height="layout.height" />
          <!-- All parts, hidden if selected or floating -->
          <g
            v-for="part in flowParts"
            v-show="!isFloating(part)"
            :key="`${flowPartsRevision}-${part.id}`"
            :part-id="part.id"
            :transform="`translate(${squares(part.x)}, ${squares(part.y)})`"
            :class="[
              'flowpart',
              part.type,
              modeClass(part),
            ]"
          >
            <PartWrapper
              :part="part"
              :selected="selectedIds.includes(part.id)"
              show-hover
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
              :class="[
                part.type,
                modeClass(part),
              ]"
            >
              <PartWrapper :part="part" selected />
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
            style="pointer-events: none;"
          />
        </g>
        <BuilderToolsMenu v-model:mode="activeMode" @use="useTool">
          <template #tools>
            <ActionItem
              :disable="!history.length"
              icon="mdi-undo"
              label="Undo"
              :inset-level="0.2"
              style="min-height: 0px"
              @click="undo"
            >
              <q-item-section v-if="!dense" side class="text-uppercase">
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
              <q-item-section v-if="!dense" side class="text-uppercase">
                ctrl-Y
              </q-item-section>
            </ActionItem>
          </template>
        </BuilderToolsMenu>
      </svg>
      <div
        v-if="!hasFocus && focusWarningEnabled"
        class="unfocus-overlay row items-center justify-center"
        @click.stop="setFocus"
      >
        <transition appear name="fade">
          <div class="text-h5 text-white q-pa-lg unfocus-message col-auto">
            Click to resume editing
          </div>
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
  border-radius: 40px
  border: 2px solid silver

.fade-enter-active
  transition: opacity 4s ease

.fade-enter
  opacity: 0

  &-to
    opacity: 1
</style>
