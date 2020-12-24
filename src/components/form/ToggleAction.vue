<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class ToggleAction extends Vue {

  @Prop({ type: Boolean, required: true })
  public readonly value!: boolean;

  @Prop({ type: Boolean, default: true })
  public readonly colored!: boolean;

  @Prop({ type: String, default: 'mdi-checkbox-marked-outline' })
  public readonly iconEnabled!: string;

  @Prop({ type: String, default: 'mdi-checkbox-blank-outline' })
  public readonly iconDisabled!: string;

  get icon(): string {
    return this.value
      ? this.iconEnabled
      : this.iconDisabled;
  }

  get color(): string {
    return this.value
      ? 'primary'
      : 'white';
  }
}
</script>

<template>
  <ActionItem
    v-bind="{icon, ...$attrs}"
    :class="colored && `text-${color}`"
    @click="$emit('input', !value)"
  />
</template>
