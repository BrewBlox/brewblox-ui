<template>
  <component
    class="ProcessViewPart"
    :part="part"
    :is="component"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import componentByType from './Parts/componentByType';

/* eslint-disable */
@Component({
  props: {
    part: {
      type: Object,
      default: () => { throw new Error('Provide part information'); },
    },
  },
})
/* eslint-enable */
export default class ProcessViewItem extends Vue {
  get partType(): ProcessViewPartType {
    return this.$props.part.type as ProcessViewPartType;
  }

  get component() {
    return componentByType(this.partType);
  }
}
</script>

<style>
.ProcessViewPart,
.ProcessViewPart svg {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.ProcessViewPart path {
  stroke: #fff;
  stroke-width: 2pt;
  stroke-linecap: round;
  fill: none;
}
</style>
