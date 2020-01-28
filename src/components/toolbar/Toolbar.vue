<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class Toolbar extends Vue {

  @Prop({ type: String, required: true })
  readonly title!: string;

  @Prop({ type: String, required: false })
  readonly subtitle!: string;

  get readonly(): boolean {
    return this.$listeners.click === undefined;
  }
}
</script>

<template>
  <div class="row q-px-sm q-pt-xs q-gutter-x-sm text-deep-purple-3">
    <div
      :class="[
        'col-grow ellipsis no-select q-pa-xs text-h6',
        {pointer: !readonly}
      ]"
      @click="$emit('click')"
    >
      <q-item-label>
        {{ title }}
      </q-item-label>
      <div
        v-if="!!subtitle"
        class="no-select q-ml-md subtitle"
      >
        {{ subtitle }}
      </div>
    </div>
    <slot />
    <slot name="buttons" />
  </div>
</template>

<style lang="sass" scoped>
.subtitle
  opacity: 0.1
  position: absolute
  bottom: -0.4em
  left: 0
  font-style: italic
  font-size: 120%
  font-weight: bold
</style>
