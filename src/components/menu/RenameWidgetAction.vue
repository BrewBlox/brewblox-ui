<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';

@Component
export default class RenameWidgetAction extends CrudComponent {

  @Prop({ type: String, default: 'Rename Widget' })
  readonly label!: string;

  @Prop({ type: String, default: 'edit' })
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
  <ActionItem v-bind="itemProps" @click="startChangeWidgetTitle" />
</template>
