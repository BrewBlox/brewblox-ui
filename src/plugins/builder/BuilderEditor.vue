<script lang="ts">
import { debounce, uid } from 'quasar';
import { Dialog } from 'quasar';
import { Component, Prop, Ref, Watch } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { Coordinates } from '@/helpers/coordinates';
import { showImportDialog } from '@/helpers/dialog';
import { clampRotation } from '@/helpers/functional';
import { saveJsonFile } from '@/helpers/import-export';
import { deepCopy, deserialize, serialize } from '@/helpers/units/parseObject';

import BuilderCatalog from './BuilderCatalog.vue';
import BuilderPartMenu from './BuilderPartMenu.vue';
import CalcWorker from 'worker-loader!./calculator.worker';
import { defaultLayoutHeight, defaultLayoutWidth, deprecatedTypes, SQUARE_SIZE } from './getters';
import { asPersistentPart, asStatePart } from './helpers';
import { builderStore } from './store';
import { BuilderLayout, ClickEvent, FlowPart, PartUpdater, PersistentPart, Rect } from './types';

interface XYVals {
  x: number;
  y: number;
}

interface DragAction extends XYVals {
  part: PersistentPart;
}

interface SelectArea extends XYVals {
  width: number;
  height: number;
}

interface ToolAction {
  label: string;
  value: string;
  icon: string;
  shortcut: string;
  cursor: (part: FlowPart) => boolean;
  onClick?: (evt: ClickEvent, part: FlowPart) => void;
  onPan?: (args: PanArguments, part: FlowPart) => void;
}

@Component({
  components: {
    BuilderCatalog,
    BuilderPartMenu,
  },
})
export default class BuilderEditor extends DialogBase {

  @Ref()
  readonly grid!: any;

  worker: CalcWorker = new CalcWorker();
  specs = builderStore.specs;

  layoutId: string | null = null;
  debouncedCalculate: Function = () => { };
  flowParts: FlowPart[] = [];
  history: string[] = [];

  menuModalOpen = false;
  catalogModalOpen = false;
  catalogPartial: Partial<PersistentPart> | null = null;

  selectedTime = 0;
  selectArea: SelectArea | null = null;
  selectDragDelta: XYVals | null = null
  selectedParts: FlowPart[] = [];

  dragAction: DragAction | null = null;
  configuredPartId: string | null = null;

  tools: ToolAction[] = [
    {
      label: 'New (Click)',
      value: 'add',
      icon: 'add',
      shortcut: 'n',
      cursor: () => false,
      onClick: this.addPartClickHandler,
    },
    {
      label: 'Select (Drag or Click)',
      value: 'select',
      icon: 'mdi-select-drag',
      shortcut: 's',
      cursor: part => !!part,
      onPan: this.selectPanHandler,
      onClick: this.selectClickHandler,
    },
    {
      label: 'Move (Drag)',
      value: 'move',
      icon: 'mdi-cursor-move',
      shortcut: 'm',
      cursor: part => !!part,
      onPan: this.movePanHandler,
    },
    {
      label: 'Rotate (Click)',
      value: 'rotate-right',
      icon: 'mdi-rotate-right-variant',
      shortcut: 'r',
      cursor: part => !!part,
      onClick: this.rotateClickHandler,
    },
    {
      label: 'Flip (Click)',
      value: 'flip',
      icon: 'mdi-swap-horizontal-bold',
      shortcut: 'f',
      cursor: part => !!part,
      onClick: this.flipClickHandler,
    },
    {
      label: 'Edit Settings (Click)',
      value: 'config',
      icon: 'settings',
      shortcut: 'e',
      cursor: part => !!part,
      onClick: this.configurePartClickHandler,
    },
    {
      label: 'Interact (Click)',
      value: 'interact',
      icon: 'mdi-cursor-default',
      shortcut: 'i',
      cursor: part => !!part && !!this.specs[part.type].interactHandler,
      onClick: this.interactClickHandler,
    },
    {
      label: 'Copy (Drag)',
      value: 'copy',
      icon: 'file_copy',
      shortcut: 'c',
      cursor: part => !!part,
      onPan: this.copyPanHandler,
    },
    {
      label: 'Delete (Click)',
      value: 'delete',
      icon: 'delete',
      shortcut: 'd',
      cursor: part => !!part,
      onClick: this.deleteClickHandler,
    },
  ];

  @Prop({ type: String })
  public readonly initialLayout!: string | null;

  get editorActive(): boolean {
    return builderStore.editorActive;
  }

  get layouts(): BuilderLayout[] {
    return builderStore.layoutValues;
  }

  get layout(): BuilderLayout | null {
    return builderStore.layoutById(
      this.layoutId
      || this.initialLayout
      || builderStore.layoutIds[0]
      || '');
  }

  get parts(): PersistentPart[] {
    if (!this.layout) {
      return [];
    }
    const sizes: Record<string, number> = {};
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
        const [sizeX, sizeY] = this.specs[actual.type].size(actual);
        sizes[part.id] = sizeX * sizeY;
        return actual;
      })
      // sort parts to render largest first
      .sort((a, b) => sizes[b.id] - sizes[a.id]);
  }

  get configuredPart(): FlowPart | null {
    return this.flowParts.find(p => p.id === this.configuredPartId) || null;
  }

  get updater(): PartUpdater {
    return {
      updatePart: this.savePart,
    };
  }

  get overlaps(): [Coordinates, number][] {
    const counts: Record<string, number> = {};
    for (const part of this.parts) {
      const key = new Coordinates([part.x, part.y, 0]).toString();
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .filter(([, v]) => v > 1)
      .map(([k, v]) => [new Coordinates(k), v] as [Coordinates, number]);
  }

  get currentTool(): ToolAction {
    const toolId = builderStore.editorTool;
    return this.tools.find(tool => tool.value === toolId) || this.tools[0];
  }

  set currentTool(tool: ToolAction) {
    builderStore.commitEditorTool(tool.value);
  }

  async saveLayout(layout: BuilderLayout): Promise<void> {
    if (layout.id) {
      await builderStore.saveLayout(layout);
    } else {
      const id = uid();
      await builderStore.createLayout({ ...layout, id });
      this.layoutId = id;
    }
  }

  async saveParts(parts: PersistentPart[], saveHistory = true): Promise<void> {
    if (!this.layout) {
      return;
    }

    if (saveHistory) {
      const stored = builderStore.layoutById(this.layout.id);
      if (stored) {
        this.history.push(JSON.stringify(serialize(stored.parts)));
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
    if (this.history.length > 0) {
      this.cancelSelection();
      const parts = deserialize(JSON.parse(this.history.pop() as string));
      await this.saveParts(parts, false);
    }
  }

  async importLayout(): Promise<void> {
    showImportDialog<BuilderLayout>(async layout => {
      const id = uid();
      await builderStore.createLayout({ ...layout, id });
      this.layoutId = id;
    });
  }

  exportLayout(): void {
    if (!this.layout) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, _rev, ...exported } = this.layout;
    saveJsonFile(exported, `brewblox-${this.layout.title}-layout.json`);
  }

  renameLayout(): void {
    if (!this.layout) {
      return;
    }
    Dialog.create({
      title: 'Change Layout title',
      message: `Choose a new name for ${this.layout.title}`,
      dark: true,
      cancel: true,
      prompt: {
        model: this.layout.title,
        type: 'text',
      },
    })
      .onOk(async title => {
        if (this.layout) {
          builderStore.saveLayout({ ...this.layout, title });
        }
      });
  }

  clearParts(): void {
    Dialog.create({
      title: 'Remove parts',
      message: 'Are you sure you wish to remove all parts?',
      dark: true,
      noBackdropDismiss: true,
      cancel: true,
    })
      .onOk(() => this.saveParts([]));
  }

  removeLayout(): void {
    if (!this.layout) {
      return;
    }
    Dialog.create({
      title: 'Remove layout',
      message: `Are you sure you wish to remove ${this.layout.title}?`,
      dark: true,
      noBackdropDismiss: true,
      cancel: true,
    })
      .onOk(async () => {
        if (this.layout) {
          await builderStore.removeLayout(this.layout)
            .catch(() => { });
        }
        this.layoutId = this.layouts.length > 0
          ? this.layouts[0].id
          : null;
      });
  }

  async calculate(): Promise<void> {
    await this.$nextTick();
    this.worker.postMessage(this.parts.map(asStatePart));
  }

  gridRect(): Rect {
    const { x, y, left, right, top, bottom } = this.grid.getBoundingClientRect();
    return { x, y, left, right, top, bottom };
  }

  isClickable(part): boolean {
    return !!this.specs[part.type].interactHandler;
  }

  interact(part: FlowPart): void {
    const handler = this.specs[part.type].interactHandler;
    handler && handler(part, this.updater);
  }

  squares(val: number): number {
    return SQUARE_SIZE * val;
  }

  clickHandler(evt: ClickEvent, part: FlowPart): void {
    if (this.currentTool.onClick) {
      this.currentTool.onClick(evt, part);
    }
    evt.stopPropagation();
  }

  panHandler(args: PanArguments, part: FlowPart): void {
    if (this.currentTool.onPan) {
      this.currentTool.onPan(args, part);
    }
    args.evt.stopPropagation();
  }

  rectContains(rect: Rect, x: number, y: number): boolean {
    return x >= rect.left
      && x <= rect.right
      && y >= rect.top
      && y <= rect.bottom;
  }

  findGridSquare(grid: Rect, x: number, y: number): XYPosition | null {
    // The page offset in clicks has appeared and disappeared in various quasar releases
    // Comment or uncomment these lines when required
    // x -= window.pageXOffset;
    // y -= window.pageYOffset;
    if (!this.rectContains(grid, x, y)) {
      return null;
    }
    return {
      x: Math.floor((x - grid.x) / SQUARE_SIZE),
      y: Math.floor((y - grid.y) / SQUARE_SIZE),
    };
  }

  findClickSquare(evt: ClickEvent): XYPosition | null {
    const grid = this.gridRect();
    return (evt instanceof MouseEvent)
      ? this.findGridSquare(grid, evt.clientX, evt.clientY)
      : this.findGridSquare(grid, evt.touches[0].clientX, evt.touches[0].clientY);
  }

  unflippedArea(area: SelectArea): SelectArea {
    return {
      x: area.width >= 0 ? area.x : area.x + area.width,
      y: area.height >= 0 ? area.y : area.y + area.height,
      width: Math.abs(area.width),
      height: Math.abs(area.height),
    };
  }

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
      this.selectedTime = new Date().getTime();

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
    }
  }

  moveSelectedPanHandler(args: PanArguments, copy: boolean): void {
    if (args.isFirst) {
      this.selectDragDelta = { x: 0, y: 0 };
    }

    if (!this.selectDragDelta) {
      return;
    }

    const prevDelta = { ...this.selectDragDelta };

    this.selectDragDelta.x += args.delta.x;
    this.selectDragDelta.y += args.delta.y;

    const snapDeltaPrev = {
      x: Math.ceil(prevDelta.x / SQUARE_SIZE),
      y: Math.ceil(prevDelta.y / SQUARE_SIZE),
    };
    const snapDelta = {
      x: Math.ceil(this.selectDragDelta.x / SQUARE_SIZE),
      y: Math.ceil(this.selectDragDelta.y / SQUARE_SIZE),
    };

    if (snapDeltaPrev.x !== snapDelta.x || snapDeltaPrev.y !== snapDelta.y) {
      // We want to snap to grid during the move
      // Subtract the previous values to avoid drift
      this.selectedParts
        .forEach(part => {
          part.x = part.x + snapDelta.x - snapDeltaPrev.x;
          part.y = part.y + snapDelta.y - snapDeltaPrev.y;
        });
    }

    if (args.isFinal) {
      this.selectedTime = new Date().getTime();

      // Now also snap select area to grid
      const snapDelta = {
        x: Math.ceil(this.selectDragDelta.x / SQUARE_SIZE) * SQUARE_SIZE,
        y: Math.ceil(this.selectDragDelta.y / SQUARE_SIZE) * SQUARE_SIZE,
      };
      this.selectDragDelta = null;

      if (snapDelta.x === 0 && snapDelta.y === 0) {
        return;
      }

      if (copy) {
        this.selectedParts.forEach(p => p.id = uid());
        this.saveParts([...this.parts, ...this.selectedParts]);
      } else {
        const ids = this.selectedParts.map(part => part.id);
        this.saveParts([...this.parts.filter(p => !ids.includes(p.id)), ...this.selectedParts]);
      }
    }
  }

  cancelSelection(): void {
    this.selectedTime = 0;
    this.selectArea = null;
    this.selectedParts = [];
  }

  selectClickHandler(evt: ClickEvent, part: FlowPart): void {
    if (new Date().getTime() - this.selectedTime < 200) {
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

  movePanHandler(args: PanArguments, part: FlowPart, copy = false): void {
    if (this.selectedParts.length) {
      return this.moveSelectedPanHandler(args, copy);
    }

    if (!part) {
      return;
    }

    if (args.isFirst) {
      this.dragAction = {
        part,
        x: 0,
        y: 0,
      };
    }

    const grid = this.gridRect();

    if (this.dragAction !== null) {
      this.dragAction.x = args.position.left - (0.5 * SQUARE_SIZE) - grid.x;
      this.dragAction.y = args.position.top - (0.5 * SQUARE_SIZE) - grid.y;
    }

    if (args.isFinal) {
      const gridPos = this.findGridSquare(grid, args.position.left, args.position.top);
      if (gridPos) {
        const from = copy ? null : part;
        const id = copy ? uid() : part.id;
        this.movePart(from, { ...deepCopy(part), ...gridPos, id })
          .then(() => this.$nextTick())
          .then(() => this.dragAction = null);
      } else {
        this.dragAction = null;
      }
    }
  }

  copyPanHandler(args: PanArguments, part: FlowPart): void {
    this.movePanHandler(args, part, true);
  }

  addPartClickHandler(evt: ClickEvent): void {
    const pos = this.findClickSquare(evt);
    if (pos) {
      this.catalogPartial = pos;
      this.catalogModalOpen = true;
    }
  }

  configurePartClickHandler(evt: ClickEvent, part: FlowPart): void {
    if (part) {
      this.configuredPartId = part.id;
      this.menuModalOpen = true;
    }
  }

  interactClickHandler(evt: ClickEvent, part: FlowPart): void {
    if (part) {
      const handler = this.specs[part.type].interactHandler;
      handler && handler(part, this.updater);
    }
  }

  rotateClickHandler(evt: ClickEvent, part: FlowPart, rotation = 90): void {
    if (part) {
      const rotate = clampRotation(part.rotate + rotation);
      this.savePart({ ...part, rotate });
    }
  }

  flipClickHandler(evt: ClickEvent, part: FlowPart): void {
    if (part) {
      this.savePart({ ...part, flipped: !part.flipped });
    }
  }

  deleteClickHandler(evt: ClickEvent, part: FlowPart): void {
    if (!part) {
      return;
    }
    if (this.selectedParts.find(p => p.id === part.id)) {
      const ids = this.selectedParts.map(p => p.id);
      this.saveParts([...this.parts.filter(p => !ids.includes(p.id))]);
      this.cancelSelection();
    } else {
      this.removePart(part);
    }
  }

  async movePart(from: PersistentPart | null, to: PersistentPart): Promise<void> {
    if (from
      && from.id === to.id
      && from.x === to.x
      && from.y === to.y) {
      return;
    }

    await this.saveParts([...this.parts.filter(p => !from || p.id !== from.id), to]);
  }

  beingDragged(part: PersistentPart): boolean {
    return this.currentTool.value !== 'copy'
      && (
        !!this.dragAction && this.dragAction.part.id === part.id
        || this.selectedParts.some(p => p.id === part.id)
      );
  }

  keyHandler(evt: KeyboardEvent): void {
    if (this.menuModalOpen || this.catalogModalOpen || this.dragAction) {
      return;
    }
    const key = evt.key.toLowerCase();
    const tool = this.tools.find(t => t.shortcut === key);
    if (tool) {
      this.currentTool = tool;
      evt.stopPropagation();
    }
  }

  startAddLayout(copy: boolean): void {
    Dialog.create({
      title: 'Add Layout',
      message: 'Create a new Brewery Builder layout',
      dark: true,
      cancel: true,
      prompt: {
        model: 'Brewery Layout',
        type: 'text',
      },
    })
      .onOk(async title => {
        const id = uid();
        await builderStore.createLayout({
          id,
          title,
          width: copy && this.layout ? this.layout.width : defaultLayoutWidth,
          height: copy && this.layout ? this.layout.height : defaultLayoutHeight,
          parts: copy && this.layout ? deepCopy(this.layout.parts) : [],
        });
        this.layoutId = id;
      });
  }

  updateFlowParts({ data }: { data: FlowPart[] }): void {
    this.flowParts = data;
    if (this.selectedParts.length > 0) {
      const selectedIds = this.selectedParts.map(p => p.id);
      this.selectedParts = this.flowParts
        .filter(p => selectedIds.includes(p.id))
        .map(deepCopy);
    }
  }

  created(): void {
    builderStore.commitEditorActive(true);
    window.addEventListener('keyup', this.keyHandler);
    this.worker.onmessage = this.updateFlowParts;
    this.debouncedCalculate = debounce(this.calculate, 150, false);
    this.debouncedCalculate();
  }

  destroyed(): void {
    this.worker.terminate();
    window.removeEventListener('keyup', this.keyHandler);
    builderStore.commitEditorActive(false);
  }

  @Watch('layout')
  watchLayout(newV: BuilderLayout, oldV: BuilderLayout): void {
    if (newV === null || (oldV !== null && oldV.id !== newV.id)) {
      this.history = [];
    }
    this.debouncedCalculate();
  }

  @Watch('editorActive')
  watchActive(active): void {
    // A workaround for a hot reloading bug
    // where the editor is not destroyed when the dialog closes
    if (!active) {
      this.onDialogHide();
    }
  }
}
</script>

<template>
  <q-dialog ref="dialog" maximized no-esc-dismiss @hide="onDialogHide">
    <q-card class="maximized bg-dark" dark>
      <DialogToolbar>
        <q-item-section>
          <q-item-label>Brewery Builder Editor</q-item-label>
        </q-item-section>
      </DialogToolbar>

      <q-dialog v-model="menuModalOpen" no-backdrop-dismiss>
        <BuilderPartMenu
          v-if="menuModalOpen"
          :part="configuredPart"
          @update:part="savePart"
          @remove:part="removePart"
          @dirty="debouncedCalculate"
          @close="menuModalOpen = false"
        />
      </q-dialog>

      <q-dialog v-model="catalogModalOpen" no-backdrop-dismiss>
        <BuilderCatalog
          v-if="catalogModalOpen"
          :partial="catalogPartial"
          @create="addPart"
          @close="catalogModalOpen = false"
        />
      </q-dialog>

      <q-card-section class="row no-wrap">
        <q-list v-if="!!layout" dark bordered class="col-auto scroll">
          <q-expansion-item label="Tools" header-class="text-h6" default-opened>
            <q-separator dark inset />
            <ActionItem
              v-for="tool in tools"
              :key="tool.value"
              :active="currentTool.value === tool.value"
              :icon="tool.icon"
              :label="tool.label"
              no-close
              @click="currentTool = tool"
            >
              <q-item-section side class="text-uppercase">
                {{ tool.shortcut }}
              </q-item-section>
            </ActionItem>
          </q-expansion-item>

          <q-expansion-item label="Layout size" header-class="text-h6" default-opened>
            <q-separator dark inset />
            <q-item dark>
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
            <q-item dark>
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
          </q-expansion-item>
        </q-list>

        <!-- Fills space not taken by the sidebar -->
        <div class="col row justify-center no-wrap">
          <div class="col-auto column no-wrap" style="max-height: 90vh">
            <!-- Layout dropdown -->
            <div class="row q-mb-sm">
              <q-btn-dropdown
                :label="layout ? layout.title : 'None'"
                flat
                no-caps
                icon="widgets"
                class="col"
              >
                <q-list dark bordered>
                  <ActionItem
                    v-for="lo in layouts"
                    :key="lo.id"
                    :label="lo.title"
                    :active="layout && lo.id === layout.id"
                    icon="mdi-view-dashboard-outline"
                    @click="layoutId = lo.id"
                  />
                </q-list>
              </q-btn-dropdown>
              <q-btn
                :disable="!history.length"
                flat
                icon="mdi-undo"
                class="col-auto"
                @click="undo"
              />
              <q-btn-dropdown flat icon="settings" class="col-auto">
                <q-list dark bordered>
                  <ActionItem label="New Layout" icon="add" @click="startAddLayout(false)" />
                  <template v-if="!!layout">
                    <ActionItem label="Copy Layout" icon="file_copy" @click="startAddLayout(true)" />
                    <ActionItem icon="mdi-file-import" label="Import Layout" @click="importLayout" />
                    <ActionItem icon="edit" label="Rename Layout" @click="renameLayout" />
                    <ActionItem icon="mdi-file-export" label="Export Layout" @click="exportLayout" />
                    <ActionItem icon="delete" label="Delete all parts" @click="clearParts" />
                    <ActionItem icon="delete" label="Delete Layout" @click="removeLayout" />
                  </template>
                </q-list>
              </q-btn-dropdown>
            </div>
            <!-- Grid wrapper -->
            <div class="col column no-wrap scroll maximized">
              <div
                v-if="!!layout"
                v-touch-pan.stop.prevent.mouse.mouseStop.mousePrevent="v => panHandler(v, null)"
                :style="`
                width: ${squares(layout.width)}px;
                height: ${squares(layout.height)}px;`"
                class="q-mb-md"
              >
                <!-- No tools have a pan handler for non-part grid squares -->
                <svg
                  ref="grid"
                  class="grid-base grid-editable"
                  @click="v => clickHandler(v, null)"
                >
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
                  <g
                    v-for="part in flowParts"
                    v-show="!beingDragged(part)"
                    :key="part.id"
                    v-touch-pan.stop.prevent.mouse.mouseStop.mousePrevent="v => panHandler(v, part)"
                    :transform="`translate(${squares(part.x)}, ${squares(part.y)})`"
                    :class="{ clickable: currentTool.cursor(part), [part.type]: true }"
                    @click.stop="v => clickHandler(v, part)"
                  >
                    <PartWrapper
                      :part="part"
                      show-hover
                      @update:part="savePart"
                      @dirty="debouncedCalculate"
                    />
                  </g>
                  <g v-if="dragAction" :transform="`translate(${dragAction.x}, ${dragAction.y})`">
                    <PartWrapper :part="dragAction.part" />
                  </g>
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
                  <g
                    v-for="part in selectedParts"
                    :key="`selected-${part.id}`"
                    :transform="`translate(${squares(part.x)}, ${squares(part.y)})`"
                    :class="{ clickable: currentTool.cursor(part), [part.type]: true }"
                    @click.stop="v => clickHandler(v, part)"
                  >
                    <PartWrapper :part="part" selected />
                  </g>
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
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="stylus" scoped>
@import './grid.styl';
</style>
