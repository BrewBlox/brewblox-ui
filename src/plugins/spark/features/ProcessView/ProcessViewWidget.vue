<script lang="ts">
import Vue from 'vue';
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { clampRotation } from '@/helpers/functional';
import { isSamePart, component, pathsFromSources } from './calculateFlows';
import { SQUARE_SIZE } from './getters';
import { parts as knownParts } from './register';
import { Part, ProcessViewConfig, FlowPart } from './state';

interface DragAction {
  part: Part;
  style: any;
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
    const parts = config.parts
      .map(({ flow, liquid, transitions, ...persistent }: FlowPart) => persistent);
    this.$props.onChangeConfig(this.widgetId, { ...config, parts });
  }

  get gridRect() {
    const { x, y, left, right, top, bottom } = (this.$refs.grid as any).getBoundingClientRect();
    return { x, y, left, right, top, bottom };
  }

  get availableParts(): Part[] {
    return knownParts
      .map(type => ({
        type,
        x: -1,
        y: -1,
        rotate: 0,
      }));
  }

  get parts(): Part[] {
    return this.widgetConfig.parts;
  }

  get flowParts(): FlowPart[] {
    return pathsFromSources(this.parts);
  }

  get gridClasses() {
    return this.editable
      ? ['grid-base', 'grid-editable']
      : ['grid-base'];
  }

  get partSizeStyle() {
    return {
      width: `${SQUARE_SIZE}px`,
      height: `${SQUARE_SIZE}px`,
    };
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

  partStyle(part: Part): any {
    return {
      gridColumnStart: part.x + 1,
      gridRowStart: part.y + 1,
    };
  }

  updateParts(parts: Part[]) {
    this.saveConfig({ ...this.widgetConfig, parts });
  }

  panHandler(part: Part, args: PanArguments) {
    if (!this.editable || this.contextAction) {
      return;
    }

    if (args.isFirst) {
      this.dragAction = {
        part,
        style: {},
      };
    }

    (this.dragAction as DragAction).style = {
      ...this.partSizeStyle,
      position: 'fixed',
      top: `${args.position.top - (0.5 * SQUARE_SIZE)}px`,
      left: `${args.position.left - (0.5 * SQUARE_SIZE)}px`,
    };

    if (args.isFinal) {
      const gridPos = this.findGridSquare(args.position.left, args.position.top);
      if (gridPos) {
        this.movePart(part, { ...part, ...gridPos });
      }
      this.dragAction = null;
    }
  }

  holdHandler(part: Part, args: HoldArguments) {
    if (!this.editable) {
      return;
    }

    this.contextAction = {
      idx: this.parts.findIndex(p => isSamePart(p, part)),
    };
    this.modalOpen = true;
  }

  removePart(part: Part) {
    this.updateParts(this.parts.filter(p => !isSamePart(p, part)));
  }

  movePart(from: Part, to: Part) {
    const spotTaken = this.widgetConfig.parts.some(p => p.x === to.x && p.y === to.y);
    if (!spotTaken) {
      this.updateParts([
        ...this.widgetConfig.parts.filter(p => !isSamePart(p, from)), to]);
    }
  }

  updatePart(idx: number, part: Part | FlowPart) {
    this.updateParts(this.parts.map((p, i) => (idx === i ? part : p)));
  }

  beingDragged(part: Part) {
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
        display="span"
      />
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn v-if="editable" slot="right" flat round dense icon="delete" @click="updateParts([])"/>
      <q-btn v-if="editable" slot="right" flat round dense icon="extension">
        <q-popover>
          <q-list link style="padding: 5px">
            <q-item v-for="part in availableParts" :key="part.type" :style="partSizeStyle">
              <ProcessViewItem v-touch-pan="v => panHandler(part, v)" :value="part"/>
            </q-item>
          </q-list>
        </q-popover>
      </q-btn>
      <q-toggle slot="right" v-model="editable"/>
    </q-card-title>
    <q-card-separator/>
    <ProcessViewItem v-if="dragAction" :value="dragAction.part" :style="dragAction.style"/>
    <div ref="grid" :class="gridClasses">
      <div
        v-touch-pan="v => panHandler(part, v)"
        v-touch-hold="v => holdHandler(part, v)"
        v-for="(part, idx) in parts"
        v-show="!beingDragged(part)"
        :key="`${part.x}_${part.y}`"
        :style="partStyle(part)"
        class="grid-item"
      >
        <div v-if="editable" class="grid-item-coordinates">{{ part.x }},{{ part.y }}</div>
        <ProcessViewItem :value="flowParts[idx]" @input="v => updatePart(idx, v)"/>
      </div>
    </div>
  </q-card>
</template>

<style lang="stylus" scoped>
@import '../../../../../src/css/app.styl';

.grid-base {
  width: 100%;
  height: 100%;
  display: grid;
  background-size: 50px 50px, 50px 50px;
  background-position: 0 -1px, -1px 0;
  border-top: 1px solid $dark_bright;
  grid-auto-columns: 50px;
  grid-auto-rows: 50px;
  grid-template-columns: repeat(autofill, 50px);
  grid-template-rows: repeat(autofill, 50px);
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
  color: $white;
  font-size: x-small;
  position: absolute;
  top: 2px;
  left: 2px;
  z-index: 2;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
