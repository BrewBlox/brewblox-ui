<script lang="ts">
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { isSamePart, calculateNormalizedFlows } from './calculateFlows';
import { SQUARE_SIZE } from './getters';
import { parts as knownParts } from './register';
import { PersistentPart, ProcessViewConfig, FlowPart } from './state';

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
        x: -1,
        y: -1,
        rotate: 0,
      }));
  }

  get parts(): PersistentPart[] {
    return this.widgetConfig.parts;
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
    if (!this.editable || this.contextAction) {
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

  movePart(from: PersistentPart, to: PersistentPart) {
    const spotTaken = this.widgetConfig.parts.some(p => p.x === to.x && p.y === to.y);
    if (!spotTaken) {
      this.updateParts([
        ...this.widgetConfig.parts.filter(p => !isSamePart(p, from)), to]);
    }
  }

  updatePart(idx: number, part: PersistentPart | FlowPart) {
    this.updateParts(this.parts.map((p, i) => (idx === i ? part : p)));
  }

  beingDragged(part: PersistentPart) {
    return this.dragAction && isSamePart(part, this.dragAction.part);
  }
}
</script>

<template>
  <q-card dark>
    <q-modal v-model="modalOpen" no-backdrop-dismiss>
      <ProcessViewForm
        v-if="modalOpen"
        :value="flowParts[contextAction.idx]"
        @input="v => updatePart(contextAction.idx, v)"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <InputPopupEdit
        :field="widgetId"
        :change="v => widgetId = v"
        label="Widget ID"
        tag="span"
      />
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn v-if="editable" slot="right" flat round dense icon="delete" @click="updateParts([])"/>
      <q-btn v-if="editable" slot="right" flat round dense icon="extension">
        <q-popover>
          <q-list link style="padding: 5px">
            <q-item v-for="part in availableParts" :key="part.type">
              <svg v-touch-pan="v => panHandler(part, v)">
                <ProcessViewItem :value="part"/>
              </svg>
            </q-item>
          </q-list>
        </q-popover>
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
        :key="`${part.x}_${part.y}`"
        class="grid-item"
      >
        <text
          v-if="editable"
          fill="white"
          x="0"
          y="8"
          class="grid-item-coordinates"
        >{{ part.x }},{{ part.y }}</text>
        <ProcessViewItem :value="flowParts[idx]" @input="v => updatePart(idx, v)"/>
        <rect v-if="editable" fill="red" fill-opacity="0" x="0" y="0" width="50" height="50"/>
      </g>
      <g v-if="dragAction" :transform="`translate(${dragAction.x}, ${dragAction.y})`">
        <ProcessViewItem :value="dragAction.part"/>
      </g>
    </svg>
  </q-card>
</template>

<style lang="stylus" scoped>
@import '../../../../../src/css/app.styl';

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
