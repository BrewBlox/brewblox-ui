<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import componentByType from './Parts/componentByType';

@Component({
  props: {
    part: {
      type: Object,
      required: true,
    },
    frame: {
      type: Number,
      default: 0,
    },
  },
})
export default class ProcessViewItem extends Vue {
  get style() {
    if (!this.$props.part.rotate) {
      return {};
    }

    return {
      transform: `rotate(${this.$props.part.rotate}deg)`,
    };
  }

  get partType(): ProcessViewPartType {
    return this.$props.part.type as ProcessViewPartType;
  }

  get component() {
    return componentByType(this.partType);
  }
}
</script>

<template>
  <component
    class="ProcessViewPart"
    :style="style"
    :part="part"
    :animationFrame="frame"
    :is="component"
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
  stroke-width: 6px;
}
</style>
