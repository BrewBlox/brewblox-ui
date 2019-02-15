<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { ComponentConstructor } from '../state';
import { SQUARE_SIZE } from '../getters';

@Component({
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
})
export default class ProcessViewItem extends Vue {
  get style() {
    return this.$props.value.rotate
      ? { transform: `rotate(${this.$props.value.rotate}deg)` }
      : {};
  }

  get component(): ComponentConstructor {
    return Vue.component(this.$props.value.type) as ComponentConstructor;
  }

  get size() {
    if (this.component.size !== undefined) {
      return this.component.size(this.$props.value);
    }
    return [1, 1];
  }

  get transformOrigin() {
    return this.size.map(v => v * SQUARE_SIZE / 2).join(' ');
  }
}
</script>

<template>
  <component
    v-if="component"
    :style="style"
    :value="value"
    :is="component"
    :transform-origin="transformOrigin"
    class="ProcessViewPart"
  />
</template>

<style>
/* not scoped */
.ProcessViewPart,
.ProcessViewPart svg {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.ProcessViewPart {
  stroke-width: 2px;
  stroke-linecap: round;
  fill: none;
}

.ProcessViewPart .fill {
  fill: #fff;
}

.ProcessViewPart .outline {
  stroke: #fff;
}

.ProcessViewPart .liquid {
  stroke-width: 7px;
}

.clickable {
  cursor: pointer;
}
</style>
