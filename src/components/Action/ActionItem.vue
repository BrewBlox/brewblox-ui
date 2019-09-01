<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class ActionItem extends Vue {

  @Prop({ type: String, required: false })
  readonly label!: string;

  @Prop({ type: String, required: false })
  readonly icon!: string;

  @Prop({ type: Boolean, default: false })
  readonly active!: boolean;

  @Prop({ type: Boolean, default: false })
  readonly noClose!: boolean;

  @Prop({ type: Object, default: () => ({}) })
  readonly itemProps!: any;

  @Prop({ type: Boolean, default: false })
  readonly disabled!: boolean;


  get combinedProps(): Record<string, any> {
    return {
      dark: true,
      clickable: !this.disabled,
      active: this.active && !this.disabled,
      ...this.itemProps,
    };
  }

  get itemClass(): Record<string, boolean> {
    return {
      darkened: this.disabled,
    };
  }

  onClick(): void {
    if (!this.disabled) {
      this.$emit('click');
    }
  }
}
</script>

<template>
  <q-item
    v-close-popup="!noClose && !disabled"
    v-bind="combinedProps"
    :class="itemClass"
    @click="onClick"
  >
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section>{{ label }}</q-item-section>
    <slot />
  </q-item>
</template>
