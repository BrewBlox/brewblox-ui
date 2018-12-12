<script lang="ts">
import WidgetBase from '@/components/Widget/WidgetBase';
import Vue from 'vue';
import Component from 'vue-class-component';
import { isSamePart, pathsFromSources } from './calculateFlows';
import { allParts, componentByType } from './Parts/componentByType';
import ProcessViewItem from './ProcessViewItem.vue';

interface DragAction {
  part: ProcessViewPart;
  style: any;
}

@Component({
  components: {
    ProcessViewItem,
  },
})
export default class ProcessViewWidget extends WidgetBase {
  debug: boolean = true;
  gridSquareSize: number = 50;
  frame: number = 0;
  animationFrame: number = 0;
  stateParts: ProcessViewPart[] = [];
  dragAction: DragAction | null = null;

  get gridRect() {
    const { x, y, left, right, top, bottom } = (this.$refs.grid as any).getBoundingClientRect();
    return { x, y, left, right, top, bottom };
  }

  gridContains(x: number, y: number) {
    const { left, right, top, bottom } = this.gridRect;
    return x >= left
      && x <= right
      && y >= top
      && y <= bottom;
  }

  gridSquare(x: number, y: number) {
    if (!this.gridContains(x, y)) {
      return null;
    }
    return {
      x: Math.floor((x - this.gridRect.x) / this.gridSquareSize),
      y: Math.floor((y - this.gridRect.y) / this.gridSquareSize),
    };
  }

  get widgetConfig(): ProcessViewConfig {
    return this.$props.config;
  }

  saveConfig(config: ProcessViewConfig = this.widgetConfig) {
    this.$props.onConfigChange(this.widgetId, { ...config });
  }

  get availableParts(): ProcessViewPart[] {
    return Object.keys(allParts)
      .map(key => ({
        x: -1,
        y: -1,
        rotate: 0,
        type: key as ProcessViewPartType,
      }));
  }

  get parts(): ProcessViewPart[] {
    return [
      ...this.widgetConfig.parts
        .map(item => (this.stateParts.find(part => isSamePart(item, part)) || item)),
      ...this.stateParts
        .filter(item => !this.widgetConfig.parts.find(part => isSamePart(item, part))),
    ];
  }

  get partsWithComponent(): ProcessViewPartWithComponent[] {
    return this.parts.map((part: ProcessViewPart) => ({
      ...part,
      component: componentByType(part.type),
    }));
  }

  get partsWithFlows(): ProcessViewPartWithComponent[] {
    return pathsFromSources(this.partsWithComponent);
  }

  get gridStyle(): any {
    return {
      width: '100%',
      height: '100%',
      gridTemplateColumns: `repeat(autofill, ${this.gridSquareSize}px)`,
      gridTemplateRows: `repeat(autofill, ${this.gridSquareSize}px)`,
    };
  }

  get partSizeStyle() {
    return {
      width: `${this.gridSquareSize}px`,
      height: `${this.gridSquareSize}px`,
    };
  }

  partStyle(part: ProcessViewPart): any {
    return {
      gridColumnStart: part.x + 1,
      gridRowStart: part.y + 1,
    };
  }

  tickAnimation() {
    this.animationFrame = window.requestAnimationFrame((timestamp) => {
      if (!this.debug) {
        this.frame = (timestamp % 2000) / 2000;
      }
      this.tickAnimation();
    });
  }

  toggleClosed(part: ProcessViewPartWithComponent, closed: boolean) {
    if (this.stateParts.some(item => isSamePart(part, item))) {
      this.stateParts = this.stateParts.map(item =>
        isSamePart(part, item) ? { ...item, closed } : item);
    } else {
      this.stateParts = [
        ...this.stateParts,
        {
          closed,
          x: part.x,
          y: part.y,
          rotate: part.rotate,
          type: part.type,
        },
      ];
    }
  }

  panHandler(part: ProcessViewPart, args: PanArguments) {
    if (args.isFirst) {
      this.dragAction = {
        part,
        style: {},
      };
    }

    (this.dragAction as DragAction).style = {
      ...this.partSizeStyle,
      position: 'fixed',
      top: `${args.position.top - (0.5 * this.gridSquareSize)}px`,
      left: `${args.position.left - (0.5 * this.gridSquareSize)}px`,
    };

    if (args.isFinal) {
      const gridPos = this.gridSquare(args.position.left, args.position.top);
      if (gridPos) {
        this.movePart(part, { ...part, ...gridPos });
      } else {
        this.removePart(part);
      }
      this.dragAction = null;
    }
  }

  removePart(part: ProcessViewPart) {
    this.widgetConfig.parts = this.widgetConfig.parts
      .filter(p => !isSamePart(p, part));
    this.saveConfig();
  }

  movePart(from: ProcessViewPart, to: ProcessViewPart) {
    const spotTaken = this.widgetConfig.parts.some(p => p.x === to.x && p.y === to.y);
    if (!spotTaken) {
      this.widgetConfig.parts = [
        ...this.widgetConfig.parts.filter(p => !isSamePart(p, from)), to];
      this.saveConfig();
    }
  }

  beingDragged(part: ProcessViewPart) {
    return this.dragAction && isSamePart(part, this.dragAction.part);
  }

  rotatePart(part: ProcessViewPart) {
    part.rotate += 90;
    this.saveConfig();
  }

  mounted() {
    this.tickAnimation();
  }

  destroyed() {
    window.cancelAnimationFrame(this.animationFrame);
  }
}
</script>

<template>
  <q-card dark>
    <q-card-title class="title-bar">
      <InputPopupEdit
        :field="widgetId"
        label="Widget ID"
        display="span"
        :change="v => widgetId = v"
      />
      <span class="vertical-middle on-left" slot="right">{{ displayName }}</span>
      <q-btn flat round dense slot="right" icon="tune">
        <q-popover>
          <q-list>
            <q-item>
              <q-checkbox label="Debug" v-model="debug"/>
            </q-item>
            <q-item v-if="debug">
              Frame:
              <input step="0.01" type="range" min="0" max="1" v-model.number="frame">
              <div>{{frame}}</div>
            </q-item>
          </q-list>
        </q-popover>
      </q-btn>
      <q-btn flat round dense slot="right" icon="extension">
        <q-popover>
          <q-list link style="padding: 5px">
            <q-item v-for="part in availableParts" :key="part.type" :style="partSizeStyle">
              <ProcessViewItem :part="part" v-touch-pan="v => panHandler(part, v)"/>
            </q-item>
          </q-list>
        </q-popover>
      </q-btn>
    </q-card-title>
    <q-card-separator/>
    <ProcessViewItem v-if="dragAction" :part="dragAction.part" :style="dragAction.style"/>
    <div class="grid-base" :style="gridStyle" ref="grid">
      <div
        class="grid-item"
        v-for="(part, idx) in partsWithFlows"
        v-show="!beingDragged(part)"
        :key="`${part.x}_${part.y}`"
        :style="partStyle(part)"
        v-touch-pan="v => panHandler(parts[idx], v)"
        @dblclick="rotatePart(parts[idx])"
      >
        <span v-if="debug" class="grid-item-coordinates">{{ part.x }},{{ part.y }}</span>
        <ProcessViewItem :part="part" :frame="frame" v-on:toggle-closed="toggleClosed"/>
      </div>
    </div>
  </q-card>
</template>

<style lang="stylus" scoped>
@import '../../../../../src/css/app.styl';

.grid-base {
  display: grid;
  grid-auto-columns: 50px;
  grid-auto-rows: 50px;
  background-image: linear-gradient(
    $dark_bright 1px,
    transparent 1px
  ), linear-gradient(
    90deg,
    $dark_bright 1px,
    transparent 1px
  );
  background-size: 50px 50px, 50px 50px;
  background-position: 0 -1px, -1px 0;
  border-top: 1px solid $dark_bright;
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
}
</style>
