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

  get canRemove(): boolean {
    return featureStore.widgetRemoveActions(this.widget.feature).length > 0;
  }
}
</script>

<template>
  <ActionItem
    v-if="isStoreBlock && canRemove"
    v-bind="{...$attrs, ...$props}"
    @click="startRemoveBlock"
  />
</template>
