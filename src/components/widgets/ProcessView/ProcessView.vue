<script lang="ts">
import Component from 'vue-class-component';

import Widget from '../Widget';

import ProcessViewItem from './ProcessViewItem.vue';
import componentByType from './Parts/componentByType';
import { calculateFlows } from './calculateFlows';

/* eslint-disable */
@Component({
  components: {
    ProcessViewItem,
  },
})
/* eslint-enable */
class ProcessViewWidget extends Widget {
  size: number = 50;

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

  get partsWithComponent(): ProcessViewPartWithComponent[] {
    return this.parts.map(part => ({
      ...part,
      component: componentByType(part.type),
    }));
  }

  get style(): any {
    return {
      width: `${this.width * this.size}px`,
      height: `${this.height * this.size}px`,
      gridTemplateColumns: this.gridStyle(this.width),
      gridTemplateRows: this.gridStyle(this.height),
    };
  }

  get possibleFlows() {
    console.log(calculateFlows(this.partsWithComponent));
    return '';
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
}

export default ProcessViewWidget;
</script>

<template>
  <div class="ProcessView">
    <div
      class="grid-base"
      :style="style"
    >
      {{ possibleFlows }}
      <div
        class="grid-item"
        v-for="part in parts"
        :key="`${part.x}_${part.y}`"
        :style="partStyle(part)"
      >
        <span class="grid-item-coordinates">{{ part.x }},{{ part.y }}</span>
        <process-view-item :part="part" />
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
