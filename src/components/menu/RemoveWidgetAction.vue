<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';

@Component
export default class RemoveWidgetAction extends CrudComponent {

  @Prop({ type: String, default: 'Delete widget' })
  readonly label!: string;

  @Prop({ type: String, default: 'delete' })
  readonly icon!: string;

  get itemProps(): Mapped<any> {
    return {
      ...this.$attrs,
      ...this.$props,
    };
  }
}
</script>

<template>
  <ActionItem v-bind="itemProps" @click="startRemoveWidget" />
</template>
