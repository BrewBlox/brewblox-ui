<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class ScreenSizeConstrained extends Vue {
  widthOk = false;
  heightOk = false;

  @Prop({ type: Number, required: false })
  readonly minWidth!: number;

  @Prop({ type: Number, required: false })
  readonly minHeight!: number;

  updateSize(): void {
    this.widthOk = !this.minWidth || window.innerWidth >= this.minWidth;
    this.heightOk = !this.minHeight || window.innerHeight >= this.minHeight;
    this.$emit('sizeok', this.widthOk && this.heightOk);
  }

  mounted(): void {
    this.updateSize();
    this.$nextTick(() => window.addEventListener('resize', this.updateSize));
  }

  beforeDestroy(): void {
    window.removeEventListener('resize', this.updateSize);
  }
}
</script>

<template>
  <div v-if="widthOk && heightOk">
    <slot />
  </div>
</template>
