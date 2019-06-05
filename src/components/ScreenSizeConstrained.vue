<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class ScreenSizeConstrained extends Vue {
  windowWidth: number = 0;
  windowHeight: number = 0;

  @Prop({ type: Number, required: false })
  readonly minWidth!: number;

  @Prop({ type: Number, required: false })
  readonly minHeight!: number;

  get widthOk() {
    return !this.minWidth || this.windowWidth >= this.minWidth;
  }

  get heightOk() {
    return !this.minHeight || this.windowHeight >= this.minHeight;
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
