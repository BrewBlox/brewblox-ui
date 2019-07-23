<script lang="ts">
import FileSaver from 'file-saver';
import { debounce, uid } from 'quasar';
import { Dialog } from 'quasar';
import { Component, Prop, Ref, Watch } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { Coordinates } from '@/helpers/coordinates';
import { showImportDialog } from '@/helpers/dialog';
import { clampRotation } from '@/helpers/functional';
import { deepCopy, serialize } from '@/helpers/units/parseObject';

import BuilderCatalog from './BuilderCatalog.vue';
import BuilderPartMenu from './BuilderPartMenu.vue';
import { calculateNormalizedFlows } from './calculateFlows';
import { SQUARE_SIZE, defaultLayoutHeight, defaultLayoutWidth, deprecatedTypes } from './getters';
import specs from './specs';
import { builderStore } from './store';
import { BuilderLayout, ClickEvent, FlowPart, PartUpdater, PersistentPart, Rect } from './types';

interface DragAction {
  hide: boolean;
  part: PersistentPart;
  x: number;
  y: number;
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
  readonly gridWidth = 1000;
  readonly gridHeight = 800;

  @Ref()
  readonly grid!: any;

  layoutId: string | null = null;
  debouncedCalculate: Function = () => { };
  flowParts: FlowPart[] = [];

  menuModalOpen: boolean = false;
  catalogModalOpen: boolean = false;
  catalogPartial: Partial<PersistentPart> | null = null;

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
      cursor: part => !!part && !!specs[part.type].interactHandler,
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
      onClick: (evt, part) => this.removePart(part),
    },
  ];

  @Prop({ type: String })
  public readonly initialLayout!: string | null;

  get layouts(): BuilderLayout[] {
    return builderStore.layoutValues;
  }

  get layout(): BuilderLayout | null {
    const layout: BuilderLayout =
      builderStore.layoutById(
        this.layoutId
        || this.initialLayout
        || builderStore.layoutIds[0]
        || '');
    // || {
    //   id: '',
    //   title: 'New layout',
    //   width: defaultLayoutWidth,
    //   height: defaultLayoutHeight,
    //   parts: [],
    // };
    return layout;
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
        const [sizeX, sizeY] = specs[actual.type].size(actual);
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
    for (let part of this.parts) {
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

  async saveLayout(layout: BuilderLayout) {
    if (layout.id) {
      await builderStore.saveLayout(layout);
    } else {
      const id = uid();
      await builderStore.createLayout({ ...layout, id });
      this.layoutId = id;
    }
  }

  async saveParts(parts: PersistentPart[]) {
    if (!this.layout) {
      return;
    }

    const asPersistent = (part: PersistentPart | FlowPart) => {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { transitions, flows, ...persistent } = part as FlowPart;
      return persistent;
    };

    // first set local value, to avoid jitters caused by the period between action and VueX refresh
    this.layout.parts = parts.map(asPersistent);
    await this.saveLayout(this.layout);
    this.debouncedCalculate();
  }

  async savePart(part: PersistentPart) {
    await this.saveParts(this.parts.map(p => (p.id === part.id ? part : p)));
  }

  async addPart(part: PersistentPart) {
    await this.saveParts([...this.parts, part]);
  }

  async removePart(part: PersistentPart) {
    await this.saveParts(this.parts.filter(p => p.id !== part.id));
  }

  async importLayout() {
    showImportDialog<BuilderLayout>(async layout => {
      const id = uid();
      await builderStore.createLayout({ ...layout, id });
      this.layoutId = id;
    });
  }

  exportLayout() {
    if (!this.layout) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, _rev, ...exported } = this.layout;
    const blob = new Blob([JSON.stringify(serialize(exported))], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, `brewblox-${this.layout.title}-layout.json`);
  }

  renameLayout() {
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

  clearParts() {
    Dialog.create({
      title: 'Remove parts',
      message: 'Are you sure you wish to remove all parts?',
      dark: true,
      noBackdropDismiss: true,
      cancel: true,
    })
      .onOk(() => this.saveParts([]));
  }

  removeLayout() {
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

  async calculate() {
    await this.$nextTick();
    this.flowParts = calculateNormalizedFlows(this.parts);
  }

  gridRect(): Rect {
    const { x, y, left, right, top, bottom } = this.grid.getBoundingClientRect();
    return { x, y, left, right, top, bottom };
  }

  isClickable(part) {
    return !!specs[part.type].interactHandler;
  }

  interact(part: FlowPart) {
    const handler = specs[part.type].interactHandler;
    handler && handler(part, this.updater);
  }

  squares(val: number): number {
    return SQUARE_SIZE * val;
  }

  clickHandler(evt: ClickEvent, part: FlowPart) {
    if (this.currentTool.onClick) {
      this.currentTool.onClick(evt, part);
    }
  }

  panHandler(args: PanArguments, part: FlowPart) {
    if (this.currentTool.onPan) {
      this.currentTool.onPan(args, part);
    }
  }

  rectContains(rect: Rect, x: number, y: number) {
    return x >= rect.left
      && x <= rect.right
      && y >= rect.top
      && y <= rect.bottom;
  }

  findGridSquare(grid: Rect, x: number, y: number) {
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

  findClickSquare(evt: ClickEvent) {
    const grid = this.gridRect();
    return (evt instanceof MouseEvent)
      ? this.findGridSquare(grid, evt.pageX, evt.pageY)
      : this.findGridSquare(grid, evt.touches[0].pageX, evt.touches[0].pageY);
  }

  movePanHandler(args: PanArguments, part: FlowPart, copy: boolean = false) {
    if (!part) {
      return;
    }

    if (args.isFirst) {
      this.dragAction = {
        part,
        hide: !copy,
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

  copyPanHandler(args: PanArguments, part: FlowPart) {
    this.movePanHandler(args, part, true);
  }

  addPartClickHandler(evt: ClickEvent) {
    const pos = this.findClickSquare(evt);
    if (pos) {
      this.catalogPartial = pos;
      this.catalogModalOpen = true;
    }
  }

  configurePartClickHandler(evt: ClickEvent, part: FlowPart) {
    if (part) {
      this.configuredPartId = part.id;
      this.menuModalOpen = true;
    }
  }

  interactClickHandler(evt: ClickEvent, part: FlowPart) {
    if (part) {
      const handler = specs[part.type].interactHandler;
      handler && handler(part, this.updater);
    }
  }

  rotateClickHandler(evt: ClickEvent, part: FlowPart, rotation: number = 90) {
    if (part) {
      const rotate = clampRotation(part.rotate + rotation);
      this.savePart({ ...part, rotate });
    }
  }

  flipClickHandler(evt: ClickEvent, part: FlowPart) {
    if (part) {
      this.savePart({ ...part, flipped: !part.flipped });
    }
  }

  async movePart(from: PersistentPart | null, to: PersistentPart) {
    if (from
      && from.id === to.id
      && from.x === to.x
      && from.y === to.y) {
      return;
    }

    await this.saveParts([...this.parts.filter(p => !from || p.id !== from.id), to]);
  }

  beingDragged(part: PersistentPart) {
    return this.dragAction
      && this.dragAction.hide
      && this.dragAction.part.id === part.id;
  }

  keyHandler(evt: KeyboardEvent) {
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

  startAddLayout(copy: boolean) {
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

  created() {
    builderStore.commitEditorActive(true);
    this.debouncedCalculate = debounce(this.calculate, 50, false);
    this.debouncedCalculate();
  }

  mounted() {
    window.addEventListener('keyup', this.keyHandler);
  }

  destroyed() {
    window.removeEventListener('keyup', this.keyHandler);
    builderStore.commitEditorActive(false);
  }

  @Watch('layout')
  watchLayout() {
    this.debouncedCalculate();
  }
}
</script>

<template>
  <q-dialog ref="dialog" maximized @hide="onDialogHide">
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
              <q-item-section side class="text-uppercase">{{ tool.shortcut }}</q-item-section>
            </ActionItem>
          </q-expansion-item>

          <q-expansion-item label="Layout size" header-class="text-h6" default-opened>
            <q-separator dark inset />
            <q-item dark>
              <q-item-section>
                <q-item-label caption>Width</q-item-label>
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
                <q-item-label caption>Height</q-item-label>
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
                  <g
                    v-touch-pan.stop.prevent.mouse.mouseStop.mousePrevent="v => panHandler(v, part)"
                    v-for="part in flowParts"
                    v-show="!beingDragged(part)"
                    :transform="`translate(${squares(part.x)}, ${squares(part.y)})`"
                    :key="part.id"
                    :class="{ clickable: currentTool.cursor(part), [part.type]: true }"
                    @click.stop="v => clickHandler(v, part)"
                  >
                    <text
                      fill="white"
                      x="0"
                      y="8"
                      class="grid-item-coordinates"
                    >{{ part.x }},{{ part.y }}</text>
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
                      class="grid-item-coordinates"
                    >{{ val }}</text>
                  </g>
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
