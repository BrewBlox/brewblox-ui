<script lang="ts">
import pick from 'lodash/pick';
import { debounce, uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop, Ref, Watch } from 'vue-property-decorator';

import { Coordinates } from '@/helpers/coordinates';
import { createDialog } from '@/helpers/dialog';
import { clampRotation } from '@/helpers/functional';
import { deepCopy, deserialize, serialize } from '@/helpers/units/parseObject';

import BuilderCatalog from './BuilderCatalog.vue';
import BuilderPartMenu from './BuilderPartMenu.vue';
import { calculateNormalizedFlows } from './calculateFlows';
import { deprecatedTypes, SQUARE_SIZE } from './getters';
import { asPersistentPart, asStatePart, rectContains, squares } from './helpers';
import { builderStore } from './store';
import { BuilderLayout, ClickEvent, FlowPart, PartUpdater, PersistentPart, Rect } from './types';

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
  cursor: (part: FlowPart) => boolean;
  onClick?: (evt: ClickEvent, part: FlowPart) => void;
  onPan?: (args: PanArguments, part: FlowPart) => void;
}

interface ActionTool extends EditorAction {
  shortcut: string;
  use: (parts: PersistentPart[]) => void;
}

@Component({
  components: {
    BuilderCatalog,
    BuilderPartMenu,
  },
})
export default class BuilderEditor extends Vue {
  squares = squares;

  debouncedCalculate: Function = () => { };
  flowParts: FlowPart[] = [];
  history: string[] = [];
  undoneHistory: string[] = [];

  drawerOpen = !this.$dense;
  menuDialogOpen = false;
  focusWarning = true;

  selectedTime = 0;
  selectArea: SelectArea | null = null;
  selectDragDelta: XYPosition | null = null
  floatingSelection = false;
  selectedParts: FlowPart[] = [];
  hoverPos: XYPosition | null = null;
  pageFocused = true;

  floater: Floater | null = null;
  configuredPartId: string | null = null;

  updater: PartUpdater = { updatePart: this.savePart };

  @Ref()
  readonly grid!: any;

  @Ref()
  readonly page!: any;

  @Prop({ type: String })
  public readonly initialLayout!: string | null;

  @Watch('layout')
  watchLayout(newV: BuilderLayout, oldV: BuilderLayout): void {
    if (newV === null || (oldV !== null && oldV.id !== newV.id)) {
      this.history = [];
    }
    this.debouncedCalculate();
  }

  created(): void {
    this.debouncedCalculate = debounce(this.calculate, 150, false);
    this.debouncedCalculate();
  }

  async mounted(): Promise<void> {
    if (this.routeId) {
      builderStore.commitLastLayoutId(this.routeId);
    }
    await this.$nextTick();
    this.setFocus();
  }

  modes: ActionMode[] = [
    {
      label: 'Select',
      value: 'select',
      icon: 'mdi-select-drag',
      cursor: part => !!part,
      onPan: this.selectPanHandler,
      onClick: this.selectClickHandler,
    },
    {
      label: 'Interact',
      value: 'interact',
      icon: 'mdi-cursor-default',
      cursor: part => !!part && !!builderStore.spec(part).interactHandler,
      onClick: this.interactClickHandler,
    },
  ];

  tools: ActionTool[] = [
    {
      label: 'New',
      value: 'add',
      icon: 'add',
      shortcut: 'n',
      use: this.useAdd,
    },
    {
      label: 'Move',
      value: 'move',
      icon: 'mdi-cursor-move',
      shortcut: 'm',
      use: this.useMove,
    },
    {
      label: 'Copy',
      value: 'copy',
      icon: 'file_copy',
      shortcut: 'c',
      use: this.useCopy,
    },
    {
      label: 'Rotate',
      value: 'rotate-right',
      icon: 'mdi-rotate-right-variant',
      shortcut: 'r',
      use: this.useRotate,
    },
    {
      label: 'Flip',
      value: 'flip',
      icon: 'mdi-swap-horizontal-bold',
      shortcut: 'f',
      use: this.useFlip,
    },
    {
      label: 'Edit Settings',
      value: 'config',
      icon: 'settings',
      shortcut: 'e',
      use: this.useEdit,
    },
    {
      label: 'Interact',
      value: 'interact',
      icon: 'mdi-cursor-default',
      shortcut: 'i',
      use: this.useInteract,
    },
    {
      label: 'Delete',
      value: 'delete',
      icon: 'delete',
      shortcut: 'd',
      use: this.useDelete,
    },
  ]

  get layouts(): BuilderLayout[] {
    return builderStore.layoutValues;
  }

  get routeId(): string | null {
    return this.$route.params.id ?? null;
  }

  get lastId(): string | null {
    return builderStore.lastLayoutId;
  }

  get layout(): BuilderLayout | null {
    return builderStore.layoutById(this.routeId ?? this.lastId ?? builderStore.layoutIds[0]);
  }

  get parts(): PersistentPart[] {
    if (!this.layout) {
      return [];
    }
    const sizes: Mapped<number> = {};
    return this.layout.parts
      .map(part => {
        const actual: PersistentPart = {
          id: uid(),
          rotate: 0,
          settings: {},
          flipped: false,
          ...part,
          type: deprecatedTypes[part.type] || part.type,
        };
        const [sizeX, sizeY] = builderStore.spec(actual).size(actual);
        sizes[part.id] = sizeX * sizeY;
        return actual;
      })
      // sort parts to render largest first
      .sort((a, b) => sizes[b.id] - sizes[a.id]);
  }

  get configuredPart(): FlowPart | null {
    return this.flowParts.find(p => p.id === this.configuredPartId) || null;
  }

  get overlaps(): [Coordinates, number][] {
    const counts: Mapped<number> = {};
    for (const part of this.parts) {
      const key = new Coordinates([part.x, part.y, 0]).toString();
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .filter(([, v]) => v > 1)
      .map(([k, v]) => [new Coordinates(k), v] as [Coordinates, number]);
  }

  get currentMode(): ActionMode {
    const toolId = builderStore.editorMode;
    return this.modes.find(tool => tool.value === toolId) || this.modes[0];
  }

  set currentMode(tool: ActionMode) {
    builderStore.commitEditorMode(tool.value);
  }

  selectLayout(id: string | null): void {
    this.$router.replace(`/builder/${id ?? ''}`);
  }

  setFocus(): void {
    this.page?.$el.focus();
    this.checkFocus();
  }

  checkFocus(): void {
    this.$nextTick(() => {
      const el = document.querySelector('.editor-page:focus-within');
      this.pageFocused = (el !== null);
    });
  }

  async saveLayout(layout: BuilderLayout | null = this.layout): Promise<void> {
    if (layout === null) { return; }
    if (layout.id) {
      await builderStore.saveLayout(layout);
    } else {
      const id = uid();
      await builderStore.createLayout({ ...layout, id });
      this.selectLayout(id);
    }
  }

  async saveParts(parts: PersistentPart[], saveHistory = true): Promise<void> {
    if (!this.layout) { return; }

    if (saveHistory) {
      const stored = builderStore.layoutById(this.layout.id);
      if (stored) {
        this.history.push(JSON.stringify(serialize(stored.parts)));
        this.undoneHistory = [];
      }
    }

    // first set local value, to avoid jitters caused by the period between action and VueX refresh
    this.layout.parts = parts.map(asPersistentPart);
    this.debouncedCalculate();
    await this.saveLayout(this.layout);
  }

  async savePart(part: PersistentPart): Promise<void> {
    await this.saveParts(this.parts.map(p => (p.id === part.id ? part : p)));
  }

  async addPart(part: PersistentPart): Promise<void> {
    await this.saveParts([...this.parts, part]);
  }

  async removePart(part: PersistentPart): Promise<void> {
    await this.saveParts(this.parts.filter(p => p.id !== part.id));
  }

  async undo(): Promise<void> {
    if (this.layout && this.history.length > 0) {
      this.cancelSelection();

      const current = builderStore.layoutById(this.layout.id);
      if (current) {
        const state = JSON.stringify(serialize(current.parts));
        const parts = deserialize(JSON.parse(this.history.pop()!));
        await this.saveParts(parts, false);
        this.undoneHistory.push(state);
      }
    }
  }

  async redo(): Promise<void> {
    if (this.layout && this.undoneHistory.length > 0) {
      this.cancelSelection();

      const current = builderStore.layoutById(this.layout.id);
      if (current) {
        const state = JSON.stringify(serialize(current.parts));
        const parts = deserialize(JSON.parse(this.undoneHistory.pop()!));
        await this.saveParts(parts, false);
        this.history.push(state);
      }
    }
  }

  async calculate(): Promise<void> {
    await this.$nextTick();
    this.updateFlowParts(calculateNormalizedFlows(this.parts.map(asStatePart)));
  }

  gridRect(): Rect {
    return pick(this.grid.getBoundingClientRect(),
      ['x', 'y', 'left', 'right', 'top', 'bottom']);
  }

  isClickable(part): boolean {
    return !!builderStore.spec(part).interactHandler;
  }

  interact(part: FlowPart): void {
    const handler = builderStore.spec(part).interactHandler;
    handler && handler(part, this.updater);
  }

  isBusy(part: PersistentPart): boolean {
    return this.floater?.parts.some(p => p.id === part.id)
      || this.selectedParts.some(p => p.id === part.id);
  }

  updateFlowParts(parts: FlowPart[]): void {
    this.flowParts = parts;
    if (this.selectedParts.length > 0) {
      const selectedIds = this.selectedParts.map(p => p.id);
      this.selectedParts = this.flowParts
        .filter(p => selectedIds.includes(p.id))
        .map(deepCopy);
    }
  }

  clear(): void {
    if (this.floater) {
      this.floater = null;
    }
    else if (this.selectedParts.length) {
      this.selectedParts = [];
    }
  }

  dropFloater(pos: XYPosition | null, isGridPos: boolean): void {
    if (!this.floater) { return; }

    pos = isGridPos ? pos : this.findGridSquare(pos);
    if (pos) {
      const ids: string[] = [];

      this.floater.parts
        .forEach(part => {
          ids.push(part.id);
          part.x += this.floater!.x;
          part.y += this.floater!.y;
        });

      this.saveParts([
        ...this.parts.filter(p => !ids.includes(p.id)),
        ...this.floater.parts,
      ]);
    }
    this.selectedParts = [];
    this.floater = null;
  }

  findGridSquare(rawPos: XYPosition | null): XYPosition | null {
    if (rawPos === null) { return null; }
    const grid = this.gridRect();
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

  findClickSquare(evt: ClickEvent): XYPosition | null {
    const touch = (evt instanceof MouseEvent) ? evt : evt.touches[0];
    return this.findGridSquare({ x: touch.clientX, y: touch.clientY });
  }

  findPartAtPos(pos: XYPosition | null, isGridPos: boolean): FlowPart | null {
    pos = isGridPos ? pos : this.findGridSquare(pos);
    if (!pos) { return null; }
    // iterate right to left to match rendering order
    // when items overlap, the later item is rendered on top
    for (let idx = this.flowParts.length - 1; idx >= 0; idx--) {
      const part = this.flowParts[idx];
      if (pos.x >= part.x
        && pos.x < part.x + part.size[0]
        && pos.y >= part.y
        && pos.y < part.y + part.size[1]) {
        return part;
      }
    }
    return null;
  }

  findActionParts(): FlowPart[] {
    if (this.selectedParts.length) {
      return this.selectedParts;
    }
    const hovered = this.findPartAtPos(this.hoverPos, false);
    return hovered
      ? [hovered]
      : [];
  }

  unflippedArea(area: SelectArea): SelectArea {
    return {
      x: area.width >= 0 ? area.x : area.x + area.width,
      y: area.height >= 0 ? area.y : area.y + area.height,
      width: Math.abs(area.width),
      height: Math.abs(area.height),
    };
  }

  closeMenu(): void {
    this.menuDialogOpen = false;
    this.$nextTick(this.setFocus);
  }

  leaveEditor(): void {
    this.$router.back();
  }

  ////////////////////////////////////////////////////////////////
  // Modes
  ////////////////////////////////////////////////////////////////

  selectPanHandler(args: PanArguments): void {
    if (args.isFirst) {
      const grid = this.gridRect();
      this.selectArea = {
        x: args.position.left - grid.x,
        y: args.position.top - grid.y,
        width: 0,
        height: 0,
      };
    }

    if (this.selectArea) {
      const { x, y } = args.delta;
      this.selectArea.width += x;
      this.selectArea.height += y;
    }

    if (args.isFinal && this.selectArea) {
      const { x, y, width, height } = this.unflippedArea(this.selectArea);
      const startX = x / SQUARE_SIZE;
      const startY = y / SQUARE_SIZE;
      const endX = startX + (width / SQUARE_SIZE);
      const endY = startY + (height / SQUARE_SIZE);

      const ids = this.selectedParts.map(part => part.id);

      this.selectedParts.push(
        ...this.flowParts
          .filter(part =>
            !ids.includes(part.id)
            && part.x >= startX - 1
            && part.x <= endX
            && part.y >= startY - 1
            && part.y <= endY)
          .map(deepCopy));

      this.selectArea = null;
      this.selectedTime = new Date().getTime();
    }
  }

  selectClickHandler(evt: ClickEvent, part: FlowPart): void {
    if (new Date().getTime() - this.selectedTime < 500) {
      // The mouseup at the end of a pan also generates a click event - skip this
      return;
    }

    if (!part) {
      this.cancelSelection();
      return;
    }

    const selectedIdx = this.selectedParts.findIndex(p => p.id === part.id);
    if (selectedIdx >= 0) {
      this.selectedParts.splice(selectedIdx, 1);
    } else {
      this.selectedParts.push(deepCopy(part));
    }
  }

  cancelSelection(): void {
    this.selectedTime = 0;
    this.selectArea = null;
    this.selectedParts = [];
  }

  interactClickHandler(evt: ClickEvent, part: FlowPart): void {
    if (part) {
      builderStore.spec(part).interactHandler?.(part, this.updater);
    }
  }

  ////////////////////////////////////////////////////////////////
  // Tools
  ////////////////////////////////////////////////////////////////

  useAdd(): void {
    if (!this.floater) {
      createDialog({
        parent: this,
        component: BuilderCatalog,
      })
        .onOk((part: PersistentPart) => {
          this.floater = {
            moving: false,
            x: 0,
            y: 0,
            parts: [part],
          };
          this.setFocus();
        })
        .onDismiss(() => this.setFocus());
    }
  }

  useMove(parts: PersistentPart[]): void {
    if (this.floater) {
      this.dropFloater(this.hoverPos, false);
    }
    else if (parts.length) {
      const minX = Math.min(...parts.map(part => part.x));
      const minY = Math.min(...parts.map(part => part.y));
      const startPos = this.hoverPos || { x: 0, y: 0 };
      this.floater = {
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

  useCopy(parts: PersistentPart[]): void {
    if (this.floater) {
      this.dropFloater(this.hoverPos, false);
    }
    else if (parts.length) {
      const minX = Math.min(...parts.map(part => part.x));
      const minY = Math.min(...parts.map(part => part.y));
      const startPos = this.hoverPos ?? { x: 0, y: 0 };
      this.floater = {
        ...startPos,
        moving: false,
        parts: parts.map(part => ({
          ...deepCopy(part),
          id: uid(),
          x: part.x - minX,
          y: part.y - minY,
        })),
      };
    }
  }

  useRotate(parts: PersistentPart[]): void {
    if (this.floater) {
      if (this.floater.parts.length === 1) {
        const [part] = this.floater.parts;
        part.rotate = clampRotation(part.rotate + 90);
      }
    }
    else if (parts.length === 1) {
      const [part] = parts;
      this.savePart({ ...part, rotate: clampRotation(part.rotate + 90) });
    }
  }

  useFlip(parts: PersistentPart[]): void {
    if (this.floater) {
      if (this.floater.parts.length === 1) {
        const [part] = this.floater.parts;
        part.flipped = !part.flipped;
      }
    }
    else if (parts.length === 1) {
      const [part] = parts;
      this.savePart({ ...part, flipped: !part.flipped });
    }
  }

  useEdit(parts: PersistentPart[]): void {
    if (!this.floater && parts.length === 1) {
      this.configuredPartId = parts[0].id;
      this.menuDialogOpen = true;
    }
  }

  useInteract(parts: PersistentPart[]): void {
    if (!this.floater && parts.length === 1) {
      const [part] = parts;
      builderStore.spec(part).interactHandler?.(part, this.updater);
    }
  }

  useDelete(parts: PersistentPart[]): void {
    if (!this.floater && parts.length) {
      const ids = parts.map(p => p.id);
      this.saveParts([...this.parts.filter(p => !ids.includes(p.id))]);
      this.cancelSelection();
    }
  }

  ////////////////////////////////////////////////////////////////
  // Event handlers
  ////////////////////////////////////////////////////////////////

  onGridMove(evt: MouseEvent): void {
    this.hoverPos = { x: evt.pageX, y: evt.pageY };
    if (this.floater) {
      const pos = this.findGridSquare(this.hoverPos);
      if (pos) {
        this.floater.x = pos.x;
        this.floater.y = pos.y;
      }
    }
  }

  onGridLeave(): void {
    this.hoverPos = null;
  }

  clickHandler(evt: ClickEvent, part: FlowPart): void {
    if (this.floater) {
      this.dropFloater(this.findClickSquare(evt), true);
    }
    else if (this.currentMode.onClick) {
      this.currentMode.onClick(evt, part);
    }
    evt.stopPropagation();
  }

  keyHandler(evt: KeyboardEvent): void {
    const key = evt.key.toLowerCase();
    const tool = this.tools.find(t => t.shortcut === key);

    // Capture escape key
    if (evt.keyCode === 27) {
      this.clear();
    }
    else if (evt.ctrlKey) {
      if (key === 'z') { this.undo(); };
      if (key === 'y') { this.redo(); };
    }
    else if (tool) {
      tool.use(this.findActionParts());
    }
    else {
      return; // not handled - don't stop propagation
    }
    evt.stopPropagation();
  }

  panHandler(args: PanArguments, part: FlowPart): void {
    if (this.currentMode.onPan) {
      this.currentMode.onPan(args, part);
    }
    args.evt.stopPropagation();
  }
}
</script>

<template>
  <q-layout
    ref="page"
    view="hHh Lpr fFf"
    class="editor-page"
    tabindex="-1"
    @keyup.native="keyHandler"
    @focusout.native="checkFocus"
  >
    <LayoutHeader @menu="drawerOpen = !drawerOpen">
      <template #title>
        Brewery Builder
      </template>
      <template #buttons>
        <div class="row">
          <q-btn-dropdown
            :label="layout ? ($dense ? '' : layout.title) : 'None'"
            flat
            no-caps
            icon="widgets"
            class="col"
            size="md"
          >
            <q-list bordered>
              <q-list>
                <ActionItem
                  v-for="lo in layouts"
                  :key="lo.id"
                  :label="lo.title"
                  :active="layout && lo.id === layout.id"
                  icon="mdi-view-dashboard-outline"
                  @click="selectLayout(lo.id)"
                />
              </q-list>
            </q-list>
          </q-btn-dropdown>
        </div>

        <LayoutActions
          :layout="layout"
          :select-layout="selectLayout"
          :save-parts="saveParts"
          stretch
        />

        <q-btn flat stretch icon="mdi-close-circle" size="md" @click="leaveEditor" />
      </template>
    </LayoutHeader>
    <LayoutFooter />

    <q-drawer v-model="drawerOpen" content-class="bg-dark column" elevated>
      <SidebarNavigator active-section="builder" />

      <q-scroll-area
        v-if="!!layout"
        class="col"
        :thumb-style="{opacity: 0.5, background: 'silver'}"
      >
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
              :value="layout.width"
              :min="5"
              :max="50"
              label
              label-always
              @change="v => { layout.width = v; saveLayout() }"
            />
          </q-item-section>
        </q-item>
        <q-item :inset-level="0.2">
          <q-item-section>
            <q-item-label caption>
              Height
            </q-item-label>
            <q-slider
              :value="layout.height"
              :min="5"
              :max="50"
              label
              label-always
              @change="v => { layout.height = v; saveLayout() }"
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
      </q-scroll-area>
    </q-drawer>

    <q-dialog v-model="menuDialogOpen" no-backdrop-dismiss @keyup.esc="closeMenu">
      <BuilderPartMenu
        v-if="menuDialogOpen"
        :part="configuredPart"
        @update:part="savePart"
        @remove:part="removePart"
        @dirty="debouncedCalculate"
        @close="closeMenu"
      />
    </q-dialog>

    <q-page-container class="bg-dark-bright">
      <q-page class="row no-wrap justify-center q-pa-md">
        <div class="col-auto column no-wrap">
          <div
            v-if="!!layout"
            v-touch-pan.stop.prevent.mouse.mouseStop.mousePrevent="v => panHandler(v, null)"
            :style="{
              width: `${squares(layout.width)}px`,
              height: `${squares(layout.height)}px`,
            }"
            class="q-mb-md"
          >
            <svg
              ref="grid"
              class="grid-base grid-editable"
              @click="v => clickHandler(v, null)"
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
                :key="part.id"
                v-touch-pan.stop.prevent.mouse.mouseStop.mousePrevent="v => panHandler(v, part)"
                :transform="`translate(${squares(part.x)}, ${squares(part.y)})`"
                :class="{ pointer: currentMode.cursor(part), [part.type]: true }"
                @click.stop="v => clickHandler(v, part)"
              >
                <PartWrapper
                  :part="part"
                  show-hover
                  @update:part="savePart"
                  @dirty="debouncedCalculate"
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

<style lang="scss" scoped>
@import "./grid.sass";

.editor-page {
  outline: none;
}

.q-page-container {
  overflow: auto;
  max-height: 100vh;
  max-width: 100vw;
}

.unfocus-overlay {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.5);
  transition: 1s;
}

.resume-message {
  border-radius: 40px;
  border: 2px solid silver;
  background: $dark_bright;
}

.fade-enter-active {
  transition: opacity 4s ease;
}

.fade-enter {
  opacity: 0;
}

.fade-enter-to {
  opacity: 1;
}
</style>
