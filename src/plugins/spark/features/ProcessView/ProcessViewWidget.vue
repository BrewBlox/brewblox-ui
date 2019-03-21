<script lang="ts">
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { isSamePart, calculateNormalizedFlows } from './calculateFlows';
import { SQUARE_SIZE } from './getters';
import { parts as knownParts } from './register';
import settings from './settings';
import { PersistentPart, ProcessViewConfig, FlowPart } from './state';
import { spaceCased } from '@/helpers/functional';
import { Coordinates } from '@/helpers/coordinates';

interface DragAction {
  part: PersistentPart;
  x: number;
  y: number;
}

interface ContextAction {
  idx: number;
}

@Component
export default class ProcessViewWidget extends WidgetBase {
  SQUARE_SIZE: number = SQUARE_SIZE; // make value accessible in template
  editable: boolean = true;
  modalOpen: boolean = false;
  dragAction: DragAction | null = null;
  contextAction: ContextAction | null = null;

  get widgetConfig(): ProcessViewConfig {
    return this.$props.config;
  }

  saveConfig(config: ProcessViewConfig = this.widgetConfig) {
    this.$props.onChangeConfig(this.widgetId, config);
  }

  get gridRect() {
    const { x, y, left, right, top, bottom } = (this.$refs.grid as any).getBoundingClientRect();
    return { x, y, left, right, top, bottom };
  }

  get availableParts(): PersistentPart[] {
    return knownParts
      .map(type => ({
        type,
        x: -2,
        y: -2,
        rotate: 0,
        settings: {},
        flipped: false,
      }));
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

  partTranslate(part: PersistentPart) {
    return `translate(${part.x * SQUARE_SIZE}, ${part.y * SQUARE_SIZE})`;
  }

  partViewBox(part: PersistentPart): string {
    return settings[part.type].size(part).map(v => v * SQUARE_SIZE).join(' ');
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

  updateParts(parts: PersistentPart[]) {
    this.saveConfig({ ...this.widgetConfig, parts });
  }

  panHandler(part: PersistentPart, args: PanArguments) {
    if (!this.editable || this.modalOpen) {
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

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  holdHandler(part: PersistentPart, args: HoldArguments) {
    if (!this.editable) {
      return;
    }

    this.contextAction = {
      idx: this.parts.findIndex(p => isSamePart(p, part)),
    };
    this.modalOpen = true;
  }

  removePart(part: PersistentPart) {
    this.updateParts(this.parts.filter(p => !isSamePart(p, part)));
  }

  blockedByPart(part: PersistentPart) {
    return settings[part.type].blockedCoordinates(part);
  }

  movePart(from: PersistentPart, to: PersistentPart) {
    const toCoords: Coordinates[] = this.blockedByPart(to);
    const allBlockedCoords: Coordinates[] =
      this.widgetConfig.parts
        .reduce(
          (acc: Coordinates[], part: PersistentPart) => [...acc, ...this.blockedByPart(part)], []);

    for (let toCoord of toCoords) {
      if (allBlockedCoords.some(coord => coord.equals(toCoord))) {
        return;
      }
    }

    this.updateParts([
      ...this.widgetConfig.parts.filter(p => !isSamePart(p, from)), to]);

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
      .then(() => this.updateParts([]))
      .catch(() => { });
  }

  spaceCased(v: string): string {
    return spaceCased(v);
  }

  partKey(part: PersistentPart): string {
    return `${part.x}_${part.y}_${part.type}`;
  }
}
</script>

<template>
  <q-card dark>
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <ProcessViewForm
        v-if="modalOpen"
        :value="flowParts[contextAction.idx]"
        @input="v => updatePart(contextAction.idx, v)"
        @remove="v => { removePart(v); modalOpen = false; }"
      />
    </q-dialog>
    <q-card-title class="title-bar">
      <InputPopupEdit :field="widgetId" :change="v => widgetId = v" label="Widget ID" tag="span"/>
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn v-if="editable" slot="right" flat round dense icon="delete" @click="clearParts"/>
      <q-btn v-if="editable" slot="right" flat round dense icon="extension">
        <q-menu>
          <q-list link style="padding: 5px">
            <q-item
              v-touch-pan="v => panHandler(part, v)"
              v-for="part in availableParts"
              :key="part.type"
            >
              <q-item-side>
                <svg
                  :width="`${SQUARE_SIZE}px`"
                  :height="`${SQUARE_SIZE}px`"
                  :viewBox="`0 0 ${partViewBox(part)}`"
                >
                  <ProcessViewItem :value="part"></ProcessViewItem>
                </svg>
              </q-item-side>
              <q-item-main>{{ spaceCased(part.type) }}</q-item-main>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-toggle slot="right" v-model="editable"/>
    </q-card-title>
    <q-card-separator/>
    <svg ref="grid" :class="gridClasses">
      <g
        v-touch-pan="v => panHandler(part, v)"
        v-touch-hold="v => holdHandler(part, v)"
        v-for="(part, idx) in parts"
        v-show="!beingDragged(part)"
        :transform="partTranslate(part)"
        :key="partKey(part)"
        class="grid-item"
      >
        <text
          v-if="editable"
          fill="white"
          x="0"
          y="8"
          class="grid-item-coordinates"
        >{{ part.x }},{{ part.y }}</text>
        <ProcessViewItem :value="flowParts[idx]" @input="v => updatePart(idx, v)"></ProcessViewItem>
        <rect
          v-if="editable"
          :width="SQUARE_SIZE"
          :height="SQUARE_SIZE"
          stroke="silver"
          stroke-opacity="0.6"
          fill-opacity="0"
        ></rect>
      </g>
      <g v-if="dragAction" :transform="`translate(${dragAction.x}, ${dragAction.y})`">
        <ProcessViewItem :value="dragAction.part"></ProcessViewItem>
      </g>
    </svg>
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
