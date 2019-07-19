<script lang="ts">
import { Dialog, uid } from 'quasar';
import { Component, Emit, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/Widget/CrudComponent';
import { Coordinates } from '@/helpers/coordinates';
import { clampRotation } from '@/helpers/functional';
import { deepCopy } from '@/helpers/units/parseObject';

import BuilderCatalog from './BuilderCatalog.vue';
import BuilderPartMenu from './BuilderPartMenu.vue';
import { SQUARE_SIZE } from './getters';
import specs from './specs';
import { builderStore } from './store';
import { BuilderConfig, BuilderLayout, ClickEvent, FlowPart, PartUpdater, PersistentPart, Rect } from './types';

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
export default class BuilderForm extends CrudComponent {
  $refs!: {
    grid: any;
  }

  localToolId: string | null = null;

  @Prop({ type: Object, required: true })
  readonly widgetGridRect!: any;

  @Prop({ type: Array, required: true })
  readonly parts!: PersistentPart[];

  @Prop({ type: Array, required: true })
  readonly flowParts!: FlowPart[];

  menuModalOpen: boolean = false;
  catalogModalOpen: boolean = false;

  dragAction: DragAction | null = null;
  configuredPartId: string | null = null;
  catalogPartial: Partial<PersistentPart> | null = null;

  @Emit('parts')
  updateParts(parts: PersistentPart[]) {
    return parts;
  }

  @Emit('part')
  updatePart(part: PersistentPart) {
    return part;
  }

  @Emit('dirty')
  invalidateFlows() { }

  @Emit('remove')
  removePart(part: PersistentPart) {
    return part;
  }

  get widgetConfig(): BuilderConfig {
    return {
      currentLayoutId: null,
      layoutIds: [],
      ...this.widget.config as Partial<BuilderConfig>,
    };
  }

  get gridHeight() {
    const { top, bottom } = this.widgetGridRect;
    return bottom - top;
  }

  get gridWidth() {
    const { left, right } = this.widgetGridRect;
    return right - left;
  }

  gridRect(): Rect {
    const { x, y, left, right, top, bottom } = this.$refs.grid.getBoundingClientRect();
    return { x, y, left, right, top, bottom };
  }

  clearParts() {
    Dialog.create({
      title: 'Remove all',
      message: 'Are you sure you wish to remove all parts?',
      dark: true,
      noBackdropDismiss: true,
      cancel: true,
    })
      .onOk(() => this.updateParts([]));
  }

  get updater(): PartUpdater {
    return {
      updatePart: this.updatePart,
    };
  }

  get tools(): ToolAction[] {
    return [
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
  }

  get currentTool(): ToolAction {
    const toolId = this.localToolId || this.widgetConfig.currentToolId;
    return this.tools.find(tool => tool.value === toolId) || this.tools[0];
  }

  set currentTool(tool: ToolAction) {
    this.localToolId = tool.value;
    if (tool.value !== 'delete') {
      this.saveConfig({ ...this.widgetConfig, currentToolId: tool.value });
    }
  }

  get currentLayout(): BuilderLayout | null {
    return builderStore.layoutById(this.widgetConfig.currentLayoutId || '');
  }

  set currentLayout(layout: BuilderLayout | null) {
    this.widgetConfig.currentLayoutId = layout ? layout.id : null;
    this.saveConfig(this.widgetConfig);
  }

  get layouts(): BuilderLayout[] {
    return this.widgetConfig.layoutIds
      .map(builderStore.layoutById)
      .filter(s => s !== null);
  }

  get configuredPart(): FlowPart | null {
    return this.flowParts.find(p => p.id === this.configuredPartId) || null;
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
      this.updatePart({ ...part, rotate });
    }
  }

  flipClickHandler(evt: ClickEvent, part: FlowPart) {
    if (part) {
      this.updatePart({ ...part, flipped: !part.flipped });
    }
  }

  async movePart(from: PersistentPart | null, to: PersistentPart) {
    if (from
      && from.id === to.id
      && from.x === to.x
      && from.y === to.y) {
      return;
    }

    await this.updateParts([...this.parts.filter(p => !from || p.id !== from.id), to]);
  }

  tryAddPart(part: PersistentPart) {
    this.movePart(null, part);
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

  squares(val: number): number {
    return SQUARE_SIZE * val;
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
      .onOk(title => {
        const id = uid();
        builderStore.createLayout({
          id,
          title,
          parts: copy && this.currentLayout ? [...this.currentLayout.parts] : [],
        });
        this.widgetConfig.layoutIds.push(id);
        this.widgetConfig.currentLayoutId = id;
        this.saveConfig(this.widgetConfig);
      });
  }

  mounted() {
    window.addEventListener('keyup', this.keyHandler);
  }

  destroyed() {
    window.removeEventListener('keyup', this.keyHandler);
  }
}
</script>

<template>
  <q-card dark class="maximized bg-dark">
    <FormToolbar :crud="crud" />

    <q-dialog v-model="menuModalOpen" no-backdrop-dismiss>
      <BuilderPartMenu
        v-if="menuModalOpen"
        :part="configuredPart"
        @update:part="updatePart"
        @remove:part="removePart"
        @dirty="invalidateFlows"
        @close="menuModalOpen = false"
      />
    </q-dialog>

    <q-dialog v-model="catalogModalOpen" no-backdrop-dismiss>
      <BuilderCatalog
        v-if="catalogModalOpen"
        :partial="catalogPartial"
        @create="tryAddPart"
        @close="catalogModalOpen = false"
      />
    </q-dialog>

    <q-card-section class="row">
      <q-list dark bordered class="col-auto">
        <q-item dark dense>
          <q-item-section class="text-h6">Tools</q-item-section>
        </q-item>

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

        <q-item />
        <q-item dark dense>
          <q-item-section class="text-h6">Global Actions</q-item-section>
        </q-item>

        <q-separator dark inset />

        <ExportAction :crud="crud" no-close />
        <ActionItem icon="delete" label="Delete all parts" no-close @click="clearParts" />
      </q-list>

      <div class="col row justify-around">
        <div class="column no-wrap">
          <q-btn-dropdown
            :label="currentLayout ? currentLayout.title : 'No active layout'"
            flat
            no-caps
            icon="widgets"
            class="q-mb-sm"
          >
            <q-list dark bordered>
              <ActionItem
                v-for="layout in layouts"
                :key="layout.id"
                :label="layout.title"
                :active="currentLayout && currentLayout.id === layout.id"
                icon="mdi-view-dashboard-outline"
                @click="currentLayout = layout"
              />
              <q-separator dark inset />
              <ActionItem
                :disable="!currentLayout"
                label="Copy Layout"
                icon="file_copy"
                @click="startAddLayout(true)"
              />
              <ActionItem label="New Layout" icon="add" @click="startAddLayout(false)" />
            </q-list>
          </q-btn-dropdown>
          <div style="height: 80vh" class="scroll column no-wrap">
            <div :style="`width: ${gridWidth}px; height: ${gridHeight}px;`">
              <!-- No tools have a pan handler for non-part grid squares -->
              <svg ref="grid" class="grid-base grid-editable" @click="v => clickHandler(v, null)">
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
                    @update:part="updatePart"
                    @dirty="invalidateFlows"
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
</template>

<style lang="stylus" scoped>
@import './grid.styl';
</style>
