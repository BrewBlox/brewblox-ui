<script lang="ts">
import Component from 'vue-class-component';

import Widget from '../Widget';

import ProcessViewItem from './ProcessViewItem.vue';
import componentByType from './Parts/componentByType';
import { calculateFlows, pathsFromSources } from './calculateFlows';

/* eslint-disable */
@Component({
  components: {
    ProcessViewItem,
  },
})
/* eslint-enable */
class ProcessViewWidget extends Widget {
  size: number = 50;
  frame: number = 0;
  animationFrame: number = 0;
  debugAnimation: boolean = true;

  get width(): number {
    return this.options.width;
  }

  get height(): number {
    return this.options.height;
  }

  get name(): string {
    return this.options.name;
  }

  get parts(): ProcessViewPart[] {
    return this.options.parts;
  }

  get pathsFromSources(): any {
    return pathsFromSources(this.partsWithComponent);
  }

  get partsWithComponent(): ProcessViewPartWithComponent[] {
    return this.parts.map(part => ({
      ...part,
      component: componentByType(part.type),
    }));
  }

  get flows() {
    return calculateFlows(this.pathsFromSources);
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

  combineFlow(part: ProcessViewPart) {
    const enrichedPart = this.flows.find((flowPart: ProcessViewPart) =>
      flowPart.x === part.x &&
      flowPart.y === part.y &&
      flowPart.type === part.type &&
      flowPart.rotate === part.rotate);

    return enrichedPart || part;
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
    <div>
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
        v-for="part in parts"
        :key="`${part.x}_${part.y}`"
        :style="partStyle(part)"
      >
        <span class="grid-item-coordinates">{{ part.x }},{{ part.y }}</span>
        <process-view-item :part="combineFlow(part)" :frame="frame" />
      </div>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import '../../../css/app.styl';

.ProcessView.dashboard-item {
  background: none;
}

.grid-base {
  display: grid;
  grid-auto-columns: 50px;
  grid-auto-rows: 50px;
  background-image: linear-gradient($dark_bright 1px, transparent 1px),
    linear-gradient(90deg, $dark_bright 1px, transparent 1px);
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
