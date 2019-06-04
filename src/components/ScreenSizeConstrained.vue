<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component({
  props: {
    minWidth: {
      type: Number,
      required: false,
    },
    minHeight: {
      type: Number,
      required: false,
    },
  },
})
export default class ScreenSizeConstrained extends Vue {
  windowWidth: number = 0;
  windowHeight: number = 0;

  get widthOk() {
    return !this.$props.minWidth || this.windowWidth >= this.$props.minWidth;
  }

  get heightOk() {
    return !this.$props.minHeight || this.windowHeight >= this.$props.minHeight;
  }

  updateSize() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
  }

  mounted() {
    this.updateSize();
    this.$nextTick(() => window.addEventListener('resize', this.updateSize));
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.updateSize);
  }
}
</script>

<template>
  <div v-if="widthOk && heightOk">
    <slot/>
  </div>
</template>
