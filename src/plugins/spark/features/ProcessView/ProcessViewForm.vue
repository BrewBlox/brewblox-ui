<script lang="ts">
import { uid } from 'quasar';
import Component from 'vue-class-component';
import { FlowPart, ClickEvent, PersistentPart, Rect, ProcessViewConfig, StatePart } from './state';
import { SQUARE_SIZE } from './getters';
import settings from './settings';
import { Coordinates } from '@/helpers/coordinates';
import { clampRotation, spaceCased } from '@/helpers/functional';
import FormBase from '@/components/Form/FormBase';
import ProcessViewCatalog from './ProcessViewCatalog.vue';
import ProcessViewPartMenu from './ProcessViewPartMenu.vue';

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
  cursor?: string;
  onClick?: (evt: ClickEvent, part: PersistentPart) => void;
  onPan?: (args: PanArguments, part: PersistentPart) => void;
}

@Component({
  props: {
    widgetGridRect: {
      type: Object,
      required: true,
    },
    parts: {
      type: Array,
      required: true,
    },
    flowParts: {
      type: Array,
      required: true,
    },
  },
  components: {
    ProcessViewCatalog,
    ProcessViewPartMenu,
  },
})
export default class ProcessViewForm extends FormBase {
  SQUARE_SIZE = SQUARE_SIZE;
  spaceCased = spaceCased;

  $refs!: {
    grid: any;
  }

  menuModalOpen: boolean = false;
  catalogModalOpen: boolean = false;

  dragAction: DragAction | null = null;
  configuredPartId: string | null = null;
  catalogPartial: Partial<PersistentPart> | null = null;

  get widgetConfig(): ProcessViewConfig {
    return this.$props.field;
  }

  saveConfig(config: ProcessViewConfig = this.widgetConfig) {
    this.$props.onChangeField(config);
  }

  get gridHeight() {
    const { top, bottom } = this.$props.widgetGridRect;
    return bottom - top;
  }

  get gridWidth() {
    const { left, right } = this.$props.widgetGridRect;
    return right - left;
  }

  gridRect(): Rect {
    const { x, y, left, right, top, bottom } = this.$refs.grid.getBoundingClientRect();
    return { x, y, left, right, top, bottom };
  }

  updateParts(parts: PersistentPart[]) {
    this.$emit('parts', parts);
  }

  updatePart(part: PersistentPart) {
    this.$emit('part', part);
  }

  updatePartState(part: StatePart) {
    this.$emit('state', part);
  }

  removePart(part: PersistentPart) {
    this.$emit('remove', part);
  }

  clearParts() {
    this.$q.dialog({
      title: 'Remove all',
      message: 'Are you sure you wish to remove all parts?',
      noBackdropDismiss: true,
      cancel: true,
    })
      .onOk(() => this.updateParts([]));
  }

  get tools(): ToolAction[] {
    return [
      {
        label: 'New (Click)',
        value: 'add',
        icon: 'add',
        onClick: this.addPartClickHandler,
      },
      {
        label: 'Move (Drag)',
        value: 'move',
        icon: 'mdi-cursor-move',
        onPan: this.movePanHandler,
      },
      {
        label: 'Rotate (Click)',
        value: 'rotate-right',
        icon: 'mdi-rotate-right-variant',
        onClick: this.rotateClickHandler,
      },
      {
        label: 'Edit Settings (Click)',
        value: 'config',
        icon: 'settings',
        onClick: this.configurePartClickHandler,
      },
      {
        label: 'Copy (Drag)',
        value: 'copy',
        icon: 'file_copy',
        onPan: this.copyPanHandler,
      },
      {
        label: 'Delete (Click)',
        value: 'delete',
        icon: 'delete',
        onClick: (evt, part) => this.removePart(part),
      },
      // TODO: flip part
    ];
  }

  get currentTool(): ToolAction {
    const toolId = this.widgetConfig.currentToolId;
    return this.tools.find(tool => tool.value === toolId) || this.tools[0];
  }

  set currentTool(tool: ToolAction) {
    this.saveConfig({ ...this.widgetConfig, currentToolId: tool.value });
  }

  get configuredPart(): FlowPart | null {
    return this.$props.flowParts.find(p => p.id === this.configuredPartId) || null;
  }

  clickHandler(evt: ClickEvent, part: PersistentPart) {
    if (this.currentTool.onClick) {
      this.currentTool.onClick(evt, part);
    }
  }

  panHandler(args: PanArguments, part: PersistentPart) {
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

  movePanHandler(args: PanArguments, part: PersistentPart, copy: boolean = false) {
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
        this.movePart(from, { ...part, ...gridPos, id })
          .then(() => this.$nextTick())
          .then(() => this.dragAction = null);
      } else {
        this.dragAction = null;
      }
    }
  }

  copyPanHandler(args: PanArguments, part: PersistentPart) {
    this.movePanHandler(args, part, true);
  }

  addPartClickHandler(evt: ClickEvent, part: PersistentPart) {
    if (!part) {
      this.catalogPartial = this.findClickSquare(evt);
      this.catalogModalOpen = true;
    }
  }

  configurePartClickHandler(evt: ClickEvent, part: PersistentPart) {
    if (part) {
      this.configuredPartId = part.id;
      this.menuModalOpen = true;
    }
  }

  rotateClickHandler(evt: ClickEvent, part: PersistentPart, rotation: number = 90) {
    if (part) {
      const rotate = clampRotation(part.rotate + rotation);
      this.updatePart({ ...part, rotate });
    }
  }

  blockedByPart(part: PersistentPart) {
    return settings[part.type].blockedCoordinates(part);
  }

  async movePart(from: PersistentPart | null, to: PersistentPart) {
    if (from
      && from.id === to.id
      && from.x === to.x
      && from.y === to.y) {
      return;
    }

    const toCoords: Coordinates[] = this.blockedByPart(to);
    const allBlockedCoords: Coordinates[] =
      this.$props.parts
        .filter(part => !from || part.id !== from.id)
        .reduce(
          (acc: Coordinates[], part: PersistentPart) => [...acc, ...this.blockedByPart(part)], []);

    for (let toCoord of toCoords) {
      for (let blockedCoord of allBlockedCoords)
        if (blockedCoord.equals(toCoord)) {
          this.$q.notify({
            color: 'negative',
            icon: 'error',
            message: "Can't place this part here: location is blocked",
          });
          return;
        }
    }

    await this.updateParts([...this.$props.parts.filter(p => !from || p.id !== from.id), to]);
  }

  tryAddPart(part: PersistentPart) {
    this.movePart(null, part);
  }

  beingDragged(part: PersistentPart) {
    return this.dragAction
      && this.dragAction.hide
      && this.dragAction.part.id === part.id;
  }
}
</script>

<template>
  <q-card dark class="maximized bg-dark-bright">
    <WidgetFormToolbar v-if="!$props.embedded" v-bind="$props"/>

    <q-dialog v-model="menuModalOpen" no-backdrop-dismiss>
      <ProcessViewPartMenu
        v-if="menuModalOpen"
        :value="configuredPart"
        @input="updatePart"
        @remove="removePart"
        @close="menuModalOpen = false"
      />
    </q-dialog>

    <q-dialog v-model="catalogModalOpen" no-backdrop-dismiss>
      <ProcessViewCatalog
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

        <q-separator dark inset/>

        <ActionItem
          v-for="tool in tools"
          :key="tool.value"
          :active="currentTool.value === tool.value"
          :icon="tool.icon"
          :label="tool.label"
          no-close
          @click="currentTool = tool"
        />

        <q-item/>
        <q-item dark dense>
          <q-item-section class="text-h6">Global Actions</q-item-section>
        </q-item>

        <q-separator dark inset/>

        <ExportAction :widget-id="widgetId" no-close/>
        <ActionItem icon="delete" label="Delete all parts" no-close @click="clearParts"/>
      </q-list>

      <div class="col row justify-around">
        <div :style="`width: ${gridWidth}px; height: ${gridHeight}px;`">
          <svg
            v-touch-pan.stop.prevent.mouse.mouseStop.mousePrevent="v => panHandler(v, null)"
            ref="grid"
            class="grid-base grid-editable"
            @click="v => clickHandler(v, null)"
          >
            <g
              v-touch-pan.stop.prevent.mouse.mouseStop.mousePrevent="v => panHandler(v, part)"
              v-for="part in flowParts"
              v-show="!beingDragged(part)"
              :transform="`translate(${part.x * SQUARE_SIZE}, ${part.y * SQUARE_SIZE})`"
              :key="part.id"
              class="grid-item"
              @click.stop="v => clickHandler(v, part)"
            >
              <text fill="white" x="0" y="8" class="grid-item-coordinates">{{ part.x }},{{ part.y }}</text>
              <ProcessViewItem :value="part" @input="updatePart" @state="updatePartState"/>
              <rect
                :width="SQUARE_SIZE"
                :height="SQUARE_SIZE"
                stroke="silver"
                stroke-opacity="0.6"
                fill-opacity="0"
              />
            </g>
            <g v-if="dragAction" :transform="`translate(${dragAction.x}, ${dragAction.y})`">
              <ProcessViewItem :value="dragAction.part"/>
            </g>
          </svg>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<style lang="stylus" scoped>
@import './grid.styl';
</style>
