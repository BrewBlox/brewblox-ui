<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class ActionItem extends Vue {
  @Prop({ type: String, required: false })
  public readonly label!: string;

  @Prop({ type: String, required: false })
  public readonly icon!: string;

  @Prop({ type: String, required: false })
  public readonly tooltip!: string;

  @Prop({ type: Boolean, default: false })
  public readonly active!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly noClose!: boolean;

  @Prop({ type: Object, default: () => ({}) })
  public readonly itemProps!: any;

  @Prop({ type: Boolean, default: false })
  public readonly disabled!: boolean;

  get combinedProps(): Mapped<any> {
    return {
      clickable: !this.disabled,
      active: this.active && !this.disabled,
      ...this.itemProps,
      ...this.$attrs,
    };
  }

  get itemClass(): Mapped<boolean> {
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
  <q-item v-close-popup="noClose || disabled ? 0 : 1" v-bind="combinedProps" :class="itemClass" @click="onClick">
    <q-tooltip v-if="tooltip && !disabled">
      {{ tooltip }}
    </q-tooltip>
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section>{{ label }}</q-item-section>
    <slot />
  </q-item>
</template>
