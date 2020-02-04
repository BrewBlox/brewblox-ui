<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class Toolbar extends Vue {

  @Prop({ type: String, required: false })
  public readonly icon!: string;

  @Prop({ type: String, required: true })
  readonly title!: string;

  @Prop({ type: String, required: false })
  readonly subtitle!: string;

  get readonly(): boolean {
    return this.$listeners['title-click'] === undefined;
  }
}
</script>

<template>
  <div class="row no-wrap full-height">
    <q-icon v-if="icon" :name="icon" />
    <div class="col no-wrap row ellipsis q-px-xs text-h6 items-center">
      <div
        :class="{pointer: !readonly}"
        @click="$emit('title-click')"
      >
        {{ title }}
      </div>
      <q-space />
      <div
        v-if="!!subtitle"
        class="subtitle q-mx-sm col-shrink ellipsis"
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
  opacity: 0.8
  font-style: italic
  font-size: 70%
  font-weight: 300
</style>
