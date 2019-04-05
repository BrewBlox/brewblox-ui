<script lang="ts">
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { isSamePart, calculateNormalizedFlows } from './calculateFlows';
import { SQUARE_SIZE } from './getters';
import { parts as knownParts } from './register';
import settings from './settings';
import { PersistentPart, ProcessViewConfig, FlowPart } from './state';
import { spaceCased, clampRotation } from '@/helpers/functional';
import { Coordinates } from '@/helpers/coordinates';
import ProcessViewCatalog from './ProcessViewCatalog.vue';

type ClickEvent = MouseEvent | TouchEvent;

interface DragAction {
  part: PersistentPart;
  x: number;
  y: number;
}

interface ContextAction {
  idx: number;
}

interface ToolAction {
  label: string;
  value: string;
  onClick?: (evt: ClickEvent, part: PersistentPart) => void;
  onPan?: (args: PanArguments, part: PersistentPart) => void;
}


@Component({
  components: {
    ProcessViewCatalog,
  },
})
export default class ProcessViewWidget extends WidgetBase {
  $refs!: {
    grid: any;
  }

  // make imported values accessible in template
  SQUARE_SIZE: number = SQUARE_SIZE;
  spaceCased = spaceCased;

  editable: boolean = true;
  menuModalOpen: boolean = false;
  catalogModalOpen: boolean = false;

  dragAction: DragAction | null = null;
  configurePartIdx: number = 0;
  currentAction: ToolAction = this.actions[0];
  catalogPartial: Partial<PersistentPart> | null = null

  get widgetConfig(): ProcessViewConfig {
    return this.$props.config;
  }

  saveConfig(config: ProcessViewConfig = this.widgetConfig) {
    this.$props.onChangeConfig(this.widgetId, config);
  }

  get gridRect() {
    const { x, y, left, right, top, bottom } = this.$refs.grid.getBoundingClientRect();
    return { x, y, left, right, top, bottom };
  }

  get parts(): PersistentPart[] {
    return this.widgetConfig.parts
      .map(v => ({
        rotate: 0,
        settings: {},
        flipped: false,
        ...v,
      }));
  }

  get flowParts(): FlowPart[] {
    return calculateNormalizedFlows(this.parts);
  }

  get gridClasses() {
    return this.editable
      ? ['grid-base', 'grid-editable']
      : ['grid-base'];
  }

  get actions(): ToolAction[] {
    return [
      {
        label: 'Move Part',
        value: 'move',
        onPan: this.movePanHandler,
      },
      {
        label: 'Add Part',
        value: 'add',
        onClick: this.addPartClickHandler,
      },
      {
        label: 'Configure Part',
        value: 'config',
        onClick: this.configurePartClickHandler,
      },
      {
        label: 'Rotate left',
        value: 'rotate-left',
        onClick: (evt, part) => this.rotateClickHandler(evt, part, -90),
      },
      {
        label: 'Rotate right',
        value: 'rotate-right',
        onClick: (evt, part) => this.rotateClickHandler(evt, part, 90),
      },
      {
        label: 'Delete Part',
        value: 'delete',
        onClick: (evt, part) => this.removePart(part),
      },
      // TODO: flip part
    ];
  }

  clickHandler(evt: ClickEvent, part: PersistentPart) {
    if (this.currentAction && this.currentAction.onClick) {
      this.currentAction.onClick(evt, part);
    }
  }

  panHandler(args: PanArguments, part: PersistentPart) {
    if (this.currentAction && this.currentAction.onPan) {
      this.currentAction.onPan(args, part);
    }
  }

  gridContains(x: number, y: number) {
    const { left, right, top, bottom } = this.gridRect;
    return x >= left
      && x <= right
      && y >= top
      && y <= bottom;
  }

  findGridSquare(x: number, y: number) {
    if (!this.gridContains(x, y)) {
      return null;
    }
    return {
      x: Math.floor((x - this.gridRect.x) / SQUARE_SIZE),
      y: Math.floor((y - this.gridRect.y) / SQUARE_SIZE),
    };
  }

  findClickSquare(evt: ClickEvent) {
    return (evt instanceof MouseEvent)
      ? this.findGridSquare(evt.pageX, evt.pageY)
      : this.findGridSquare(evt.touches[0].pageX, evt.touches[0].pageY);
  }

  updateParts(parts: PersistentPart[]) {
    this.saveConfig({ ...this.widgetConfig, parts });
  }

  movePanHandler(args: PanArguments, part: PersistentPart) {
    if (!this.editable || this.menuModalOpen || !part) {
      return;
    }

    if (args.isFirst) {
      this.dragAction = {
        part,
        x: 0,
        y: 0,
      };
    }

    if (this.dragAction !== null) {
      this.dragAction.x = args.position.left - (0.5 * SQUARE_SIZE) - this.gridRect.x;
      this.dragAction.y = args.position.top - (0.5 * SQUARE_SIZE) - this.gridRect.y;
    }

    if (args.isFinal) {
      const gridPos = this.findGridSquare(args.position.left, args.position.top);
      if (gridPos) {
        this.movePart(part, { ...part, ...gridPos });
      }
      this.dragAction = null;
    }
  }

  addPartClickHandler(evt: ClickEvent, part: PersistentPart) {
    if (!part) {
      this.catalogPartial = this.findClickSquare(evt);
      this.catalogModalOpen = true;
    }
  }

  configurePartClickHandler(evt: ClickEvent, part: PersistentPart) {
    if (part) {
      this.configurePartIdx = this.parts.findIndex(p => isSamePart(p, part));
      this.menuModalOpen = true;
    }
  }

  rotateClickHandler(evt: ClickEvent, part: PersistentPart, rotation: number) {
    if (part) {
      const idx = this.parts.findIndex(p => isSamePart(p, part));
      const partSize = settings[part.type].size(part);
      const rotate = clampRotation(part.rotate + rotation);

      const updated = new Coordinates(part)
        .rotateSquare(rotation, part.rotate, partSize)
        .raw();

      this.updatePart(idx, { ...part, ...updated, rotate });
    }
  }

  removePart(part: PersistentPart) {
    this.updateParts(this.parts.filter(p => !isSamePart(p, part)));
  }

  blockedByPart(part: PersistentPart) {
    return settings[part.type].blockedCoordinates(part);
  }

  movePart(from: PersistentPart | null, to: PersistentPart) {
    const toCoords: Coordinates[] = this.blockedByPart(to);
    const allBlockedCoords: Coordinates[] =
      this.widgetConfig.parts
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

    this.updateParts([
      ...this.widgetConfig.parts.filter(p => !from || !isSamePart(p, from)),
      to,
    ]);
  }

  addPart(part: PersistentPart) {
    this.movePart(null, part);
  }

  updatePart(idx: number, part: PersistentPart | FlowPart) {
    this.updateParts(this.parts.map((p, i) => (idx === i ? part : p)));
  }

  beingDragged(part: PersistentPart) {
    return this.dragAction && isSamePart(part, this.dragAction.part);
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

  partKey(part: PersistentPart): string {
    return `${part.x}_${part.y}_${part.type}`;
  }
}
</script>

<template>
  <q-card dark class="text-white column">
    <q-dialog v-model="menuModalOpen" no-backdrop-dismiss>
      <ProcessViewForm
        v-if="menuModalOpen"
        :value="flowParts[configurePartIdx]"
        @input="v => updatePart(configurePartIdx, v)"
        @remove="v => removePart(v)"
        @close="menuModalOpen = false"
      />
    </q-dialog>

    <q-dialog v-model="catalogModalOpen" no-backdrop-dismiss>
      <ProcessViewCatalog
        v-if="catalogModalOpen"
        :partial="catalogPartial"
        @create="addPart"
        @close="catalogModalOpen = false"
      />
    </q-dialog>

    <WidgetToolbar :title="widgetTitle" :subtitle="displayName">
      <q-item-section v-if="editable" side>
        <q-select
          v-model="currentAction"
          :options="actions"
          dark
          options-dark
          label="Tool"
          style="min-width: 150px"
        />
      </q-item-section>
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

    <div class="col">
      <svg
        v-touch-pan.stop.prevent.mouse.mouseStop.mousePrevent="v => panHandler(v, null)"
        ref="grid"
        :class="gridClasses"
        @click="v => clickHandler(v, null)"
      >
        <g
          v-touch-pan.stop.prevent.mouse.mouseStop.mousePrevent="v => panHandler(v, part)"
          v-for="(part, idx) in parts"
          v-show="!beingDragged(part)"
          :transform="`translate(${part.x * SQUARE_SIZE}, ${part.y * SQUARE_SIZE})`"
          :key="partKey(part)"
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
          <ProcessViewItem :value="flowParts[idx]" @input="v => updatePart(idx, v)"/>
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
