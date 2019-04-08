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
  get transformation() {
    return `rotate(${this.$props.value.rotate}, ${SQUARE_SIZE / 2}, ${SQUARE_SIZE / 2})`;
  }
}
</script>

<template>
  <g :transform="transformation">
    <component
      v-if="value.type"
      :value="value"
      :is="value.type"
      class="ProcessViewPart"
      v-on="$listeners"
    />
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
