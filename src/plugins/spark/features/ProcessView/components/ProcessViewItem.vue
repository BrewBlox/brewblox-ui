<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
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
  get component(): any {
    return Vue.component(this.$props.value.type);
  }

  get size() {
    if (this.component.size !== undefined) {
      return this.component.size(this.$props.value);
    }
    return [1, 1];
  }

  // to rotate correctly in all browsers, center part around 0,0 before rotation
  // Firefox does not support transform-origin in SVG.
  get center() {
    return this.size.map(v => v * SQUARE_SIZE / 2);
  }
}
</script>

<template>
  <g :transform="`translate(${center.join(',')})`">
    <g :transform="`rotate(${value.rotate})`">
      <component
        v-if="component"
        :value="value"
        :is="component"
        :transform="`translate(${center.map(v => -v).join(',')})`"
        class="ProcessViewPart"
      />
    </g>
  </g>
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

.ProcessViewPart .text {
  stroke-width: 1px;
  stroke: #fff;
}

.ProcessViewPart .liquid {
  stroke-width: 7px;
}

.clickable {
  cursor: pointer;
}
</style>
