<script lang="ts">
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { uid } from 'quasar';
import { calculateNormalizedFlows } from './calculateFlows';
import { SQUARE_SIZE } from './getters';
import settings from './settings';
import { PersistentPart, ProcessViewConfig, FlowPart } from './state';
import { spaceCased, clampRotation } from '@/helpers/functional';
import { Coordinates } from '@/helpers/coordinates';
import ProcessViewCatalog from './ProcessViewCatalog.vue';

type ClickEvent = MouseEvent | TouchEvent;

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

interface Rect {
  x: number;
  y: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}


@Component({
  components: {
    ProcessViewCatalog,
  },
})
export default class ProcessViewWidget extends WidgetBase {
  // make imported values accessible in template
  SQUARE_SIZE: number = SQUARE_SIZE;
  spaceCased = spaceCased;

  $refs!: {
    grid: any;
  }

  editable: boolean = true;
  menuModalOpen: boolean = false;
  catalogModalOpen: boolean = false;

  titleModel: string = '';
  dragAction: DragAction | null = null;
  configuredPartId: string | null = null;
  currentTool: ToolAction = this.tools[0];
  catalogPartial: Partial<PersistentPart> | null = null

  get widgetConfig(): ProcessViewConfig {
    return this.$props.config;
  }

  saveConfig(config: ProcessViewConfig = this.widgetConfig) {
    this.$props.onChangeConfig(this.widgetId, config);
  }

  updateParts(parts: PersistentPart[]) {
    const asPersistent = (part: PersistentPart | FlowPart) => {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { transitions, flows, ...persistent } = part as FlowPart;
      return persistent;
    };

    this.saveConfig({ ...this.widgetConfig, parts: parts.map(asPersistent) });
  }

  updatePart(part: PersistentPart | FlowPart) {
    this.updateParts(this.parts.map(p => (p.id === part.id ? part : p)));
  }

  removePart(part: PersistentPart) {
    this.updateParts(this.parts.filter(p => p.id !== part.id));
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

  gridRect(): Rect {
    const { x, y, left, right, top, bottom } = this.$refs.grid.getBoundingClientRect();
    return { x, y, left, right, top, bottom };
  }

  get parts(): PersistentPart[] {
    return this.widgetConfig.parts
      .map(v => ({
        id: uid(),
        rotate: 0,
        settings: {},
        flipped: false,
        ...v,
      }));
  }

  get flowParts(): FlowPart[] {
    return calculateNormalizedFlows(this.parts);
  }

  get configuredPart(): FlowPart | null {
    return this.flowParts.find(p => p.id === this.configuredPartId) || null;
  }

  get gridClasses() {
    return {
      ['grid-base']: true,
      ['grid-editable']: this.editable,
    };
  }

  get tools(): ToolAction[] {
    return [
      {
        label: 'Move (Drag)',
        value: 'move',
        icon: 'mdi-cursor-move',
        onPan: this.movePanHandler,
      },
      {
        label: 'Copy (Drag)',
        value: 'copy',
        icon: 'file_copy',
        onPan: this.copyPanHandler,
      },
      {
        label: 'New (Click)',
        value: 'add',
        icon: 'add',
        onClick: this.addPartClickHandler,
      },
      {
        label: 'Configure (Click)',
        value: 'config',
        icon: 'settings',
        onClick: this.configurePartClickHandler,
      },
      {
        label: 'Rotate left (Click)',
        value: 'rotate-left',
        icon: 'mdi-rotate-left-variant',
        onClick: (evt, part) => this.rotateClickHandler(evt, part, -90),
      },
      {
        label: 'Rotate right (Click)',
        value: 'rotate-right',
        icon: 'mdi-rotate-right-variant',
        onClick: (evt, part) => this.rotateClickHandler(evt, part, 90),
      },
      {
        label: 'Remove (Click)',
        value: 'delete',
        icon: 'delete',
        onClick: (evt, part) => this.removePart(part),
      },
      // TODO: flip part
    ];
  }

  clickHandler(evt: ClickEvent, part: PersistentPart) {
    if (this.editable && this.currentTool && this.currentTool.onClick) {
      this.currentTool.onClick(evt, part);
    }
  }

  panHandler(args: PanArguments, part: PersistentPart) {
    if (this.editable && this.currentTool && this.currentTool.onPan) {
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
        this.movePart(from, { ...part, ...gridPos, id });
      }
      this.$nextTick(() => this.dragAction = null);
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

  rotateClickHandler(evt: ClickEvent, part: PersistentPart, rotation: number) {
    if (part) {
      const partSize = settings[part.type].size(part);
      const rotate = clampRotation(part.rotate + rotation);

      const updated = new Coordinates(part)
        .rotateSquare(rotation, part.rotate, partSize)
        .raw();

      this.updatePart({ ...part, ...updated, rotate });
    }
  }

  blockedByPart(part: PersistentPart) {
    return settings[part.type].blockedCoordinates(part);
  }

  movePart(from: PersistentPart | null, to: PersistentPart) {
    if (from
      && from.id === to.id
      && from.x === to.x
      && from.y === to.y) {
      return;
    }

    const toCoords: Coordinates[] = this.blockedByPart(to);
    const allBlockedCoords: Coordinates[] =
      this.parts
        .reduce(
          (acc: Coordinates[], part: PersistentPart) => [...acc, ...this.blockedByPart(part)], []);

    for (let toCoord of toCoords) {
      if (allBlockedCoords.some(coord => coord.equals(toCoord))) {
        this.$q.notify({
          color: 'negative',
          icon: 'error',
          message: "Can't place this part here: location is blocked",
        });
        return;
      }
    }

    this.updateParts([...this.parts.filter(p => !from || p.id !== from.id), to]);
  }

  tryAddPart(part: PersistentPart) {
    this.movePart(null, part);
  }

  beingDragged(part: PersistentPart) {
    return this.dragAction
      && this.dragAction.hide
      && this.dragAction.part.id === part.id;
  }

  editTitle() {
    this.titleModel = this.widgetTitle;
    this.$q.dialog({
      title: 'Edit widget title',
      cancel: true,
      prompt: {
        model: this.titleModel,
        type: 'text',
      },
    })
      .onOk(title => this.$props.onChangeTitle(this.widgetId, title));
  }
}
</script>

<template>
  <q-card dark class="text-white column">
    <q-dialog v-model="menuModalOpen" no-backdrop-dismiss>
      <ProcessViewForm
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

    <WidgetToolbar :title="widgetTitle" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat label="menu">
          <q-list dark bordered>
            <ActionItem
              v-if="editable"
              icon="mdi-pencil-off"
              label="Stop Editing"
              @click="editable = false"
            />
            <ActionItem v-else icon="mdi-pencil" label="Edit parts" @click="editable = true"/>
            <ActionItem icon="delete" label="Remove all parts" @click="clearParts"/>
            <ActionItem
              v-if="$props.onChangeTitle"
              icon="mdi-format-text"
              label="Edit widget title"
              @click="editTitle"
            />
            <ActionItem
              v-if="$props.onCopy"
              icon="file_copy"
              label="Copy widget"
              @click="$props.onCopy(widgetId)"
            />
            <ActionItem
              v-if="$props.onMove"
              icon="exit_to_app"
              label="Move widget"
              @click="$props.onMove(widgetId)"
            />
            <ActionItem
              v-if="$props.onDelete"
              icon="delete"
              label="Delete widget"
              @click="$props.onDelete(widgetId)"
            />
            <ExportAction :widget-id="widgetId"/>
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar>

    <q-card-section v-if="editable" class="q-py-none">
      <q-item dark dense class="justify-around">
        <q-item-section class="col-auto">
          <q-btn-dropdown :icon="currentTool.icon" :label="currentTool.label" flat>
            <q-list dark bordered>
              <ActionItem
                v-for="tool in tools"
                :key="tool.value"
                :icon="tool.icon"
                :label="tool.label"
                :active="currentTool.value === tool.value"
                @click="currentTool = tool"
              />
            </q-list>
          </q-btn-dropdown>
        </q-item-section>
      </q-item>
    </q-card-section>

    <div class="col">
      <svg
        v-touch-pan.stop.prevent.mouse.mouseStop.mousePrevent="v => panHandler(v, null)"
        ref="grid"
        :class="gridClasses"
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
          <text
            v-if="editable"
            fill="white"
            x="0"
            y="8"
            class="grid-item-coordinates"
          >{{ part.x }},{{ part.y }}</text>
          <ProcessViewItem :value="part" @input="updatePart"/>
          <rect
            v-if="editable"
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
  </q-card>
</template>

<style lang="stylus" scoped>
@import '../../../../../src/styles/quasar.styl';

.grid-base {
  width: 100%;
  height: 100%;
  background-size: 50px 50px, 50px 50px;
  background-position: 0 -1px, -1px 0;
  border-top: 1px solid $dark_bright;
}

.grid-editable {
  background-image: linear-gradient(
    $dark_bright 1px,
    transparent 1px
  ), linear-gradient(
    90deg,
    $dark_bright 1px,
    transparent 1px
  );
}

.grid-item {
  position: relative;
}

.grid-item-coordinates {
  font-size: x-small;
  z-index: 2;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
