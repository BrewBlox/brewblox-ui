<script>
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    colors: {
      type: Array,
      required: true,
    },
    paths: {
      type: Array,
      required: true,
    },
  },
})
export default class LiquidStroke extends Vue {
  get width() {
    return SQUARE_SIZE;
  }

  get height() {
    return SQUARE_SIZE;
  }
}
</script>

<template>
  <g>
    <g v-for="(path, idx) in paths" :key="idx">
      <path
        v-for="(color, idx) in colors"
        :d="path"
        :key="color"
        :stroke="color"
        :stroke-dashoffset="`${idx*10}`"
        stroke-linecap="butt"
        class="liquid"
        stroke-dasharray="10,20,10,20,10,20"
      />
    </g>
  </g>
</template>
