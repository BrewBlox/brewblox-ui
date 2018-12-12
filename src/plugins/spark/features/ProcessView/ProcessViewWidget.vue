<script lang="ts">
import WidgetBase from '@/components/Widget/WidgetBase';
import Vue from 'vue';
import Component from 'vue-class-component';
import { isSamePart, pathsFromSources } from './calculateFlows';
import componentByType from './Parts/componentByType';
import ProcessViewItem from './ProcessViewItem.vue';

interface DragAction {
  part: ProcessViewPart;
  style: any;
  start: {
    x: number;
    y: number;
  };
  current: {
    x: number;
    y: number;
  };
}

@Component({
  components: {
    ProcessViewItem,
  },
})
export default class ProcessViewWidget extends WidgetBase {
  debug: boolean = false;
  gridSquareSize: number = 50;
  frame: number = 0;
  animationFrame: number = 0;
  stateParts: ProcessViewPart[] = [];
  dragAction: DragAction | null = null;

  get widgetConfig(): ProcessViewConfig {
    return this.$props.config;
  }

  saveConfig(config: ProcessViewConfig = this.widgetConfig) {
    this.$props.onConfigChange(this.widgetId, { ...config });
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
    Vue.set(
      this,
      'stateParts',
      this.stateParts.some(item => isSamePart(part, item))
        ? this.stateParts.map((item) => {
          if (isSamePart(part, item)) {
            return {
              ...item,
              closed,
            };
          }

          return item;
        })
        : [
          ...this.stateParts,
          {
            closed,
            x: part.x,
            y: part.y,
            rotate: part.rotate,
            type: part.type,
          },
        ],
    );
  }

  panHandler(part: ProcessViewPart, idx: number, args: PanArguments) {
    if (args.isFirst) {
      this.dragAction = {
        part,
        start: {
          x: args.position.left,
          y: args.position.top,
        },
        current: {
          x: args.position.left,
          y: args.position.top,
        },
        style: {},
      };
    }

    const action = this.dragAction as DragAction;

    action.current = {
      x: args.position.left,
      y: args.position.top,
    };

    action.style = {
      position: 'fixed',
      top: `${args.position.top - (0.5 * this.gridSquareSize)}px`,
      left: `${args.position.left - (0.5 * this.gridSquareSize)}px`,
      width: `${this.gridSquareSize}px`,
      height: `${this.gridSquareSize}px`,
    };

    if (args.isFinal) {
      const changedPart = {
        ...part,
        x: part.x + Math.round((action.current.x - action.start.x) / this.gridSquareSize),
        y: part.y + Math.round((action.current.y - action.start.y) / this.gridSquareSize),
      };
      this.widgetConfig.parts = this.widgetConfig.parts
        .map(p => isSamePart(p, part) ? changedPart : p);
      this.saveConfig();
      this.dragAction = null;
    }
  }

  beingDragged(part: ProcessViewPart) {
    return this.dragAction && isSamePart(part, this.dragAction.part);
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
      <q-btn flat round dense slot="right" icon="extension"/>
    </q-card-title>
    <q-card-separator/>
    <div class="grid-base" :style="gridStyle">
      <ProcessViewItem v-if="dragAction" :part="dragAction.part" :style="dragAction.style"/>
      <div
        class="grid-item"
        v-for="(part, idx) in partsWithFlows"
        :key="`${part.x}_${part.y}`"
        :style="partStyle(part)"
        v-touch-pan="v => panHandler(part, idx, v)"
      >
        <span v-if="debug" class="grid-item-coordinates">{{ part.x }},{{ part.y }}</span>
        <ProcessViewItem
          v-show="!beingDragged(part)"
          :part="part"
          :frame="frame"
          v-on:toggle-closed="toggleClosed"
        />
      </div>
    </div>
  </q-card>
</template>

<style lang="stylus" scoped>
@import '../../../../../src/css/app.styl';

.ProcessView.dashboard-item {
  background: none;
}

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
