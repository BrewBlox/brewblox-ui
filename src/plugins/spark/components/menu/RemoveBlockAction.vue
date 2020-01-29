<script lang="ts">

import { Component, Prop } from 'vue-property-decorator';

import { featureStore } from '@/store/features';

import BlockCrudComponent from '../BlockCrudComponent';

@Component
export default class RemoveBlockAction extends BlockCrudComponent {

  @Prop({ type: String, default: 'Remove block' })
  readonly label!: string;

  @Prop({ type: String, default: 'delete' })
  readonly icon!: string;

  get itemProps(): Mapped<any> {
    return {
      ...this.$attrs,
      ...this.$props,
    };
  }

  get deletable(): boolean {
    return featureStore.widgetDeleters(this.widget.feature).length > 0;
  }
}
</script>

<template>
  <ActionItem v-if="isStoreBlock && deletable" v-bind="itemProps" @click="startRemoveBlock" />
</template>
