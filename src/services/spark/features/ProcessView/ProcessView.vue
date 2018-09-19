<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import Widget from '@/components/Widget/Widget';

import ProcessViewItem from './ProcessViewItem.vue';
import componentByType from './Parts/componentByType';
import { pathsFromSources, isSamePart } from './calculateFlows';

@Component({
  components: {
    ProcessViewItem,
  },
})
class ProcessViewWidget extends Widget {
  size: number = 50;
  frame: number = 0;
  animationFrame: number = 0;
  debugAnimation: boolean = true;
  stateParts: ProcessViewPart[] = [];

  get width(): number {
    return this.$props.config.width;
  }

  get height(): number {
    return this.$props.config.height;
  }

  get name(): string {
    return this.$props.config.name;
  }

  get partsFromStore(): ProcessViewPart[] {
    return this.$props.config.parts;
  }

  get parts(): ProcessViewPart[] {
    return [
      ...this.partsFromStore.map((item) => {
        const statePart = this.stateParts.find(part => isSamePart(item, part));

        if (statePart) {
          return statePart;
        }

        return item;
      }),
      ...this.stateParts.filter(item => !this.partsFromStore.find(part => isSamePart(item, part))),
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

  get style(): any {
    return {
      width: `${this.width * this.size}px`,
      height: `${this.height * this.size}px`,
      gridTemplateColumns: this.gridStyle(this.width),
      gridTemplateRows: this.gridStyle(this.height),
    };
  }

  gridStyle(amount: number): string {
    return Array(amount).fill('').map(() => `${this.size}px`).join(' ');
  }

  partStyle(part: ProcessViewPart): any {
    return {
      gridColumnStart: part.x + 1,
      gridRowStart: part.y + 1,
    };
  }

  tickAnimation() {
    this.animationFrame = window.requestAnimationFrame((timestamp) => {
      if (!this.debugAnimation) {
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

  mounted() {
    this.tickAnimation();
  }

  destroyed() {
    window.cancelAnimationFrame(this.animationFrame);
  }
}

export default ProcessViewWidget;
</script>

<template>
  <div class="ProcessView">
    <div class="debug">
      <label>
        Debug
        <input type="checkbox" v-model="debugAnimation" />
      </label>
    </div>
    <div class="debug" v-if="debugAnimation">
      Frame:
      <input
        step="0.01"
        type="range"
        min="0"
        max="1"
        v-model.number="frame"
      />
      <div>
        {{frame}}
      </div>
    </div>
    <div
      class="grid-base"
      :style="style"
    >
      <div
        class="grid-item"
        v-for="part in partsWithFlows"
        :key="`${part.x}_${part.y}`"
        :style="partStyle(part)"
      >
        <span class="grid-item-coordinates">{{ part.x }},{{ part.y }}</span>
        <process-view-item
          :part="part"
          :frame="frame"
          v-on:toggle-closed="toggleClosed"
        />
      </div>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import '../../../../../src/css/app.styl';

.ProcessView.dashboard-item {
  background: none;
}

.ProcessView .debug {
  margin: 0 0 14px 0;
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
  border: 1px solid $dark_bright;
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
