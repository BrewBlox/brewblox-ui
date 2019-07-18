<script lang="ts">

import { Component, Prop } from 'vue-property-decorator';

import { featureStore } from '@/store/features';

import BlockCrudComponent from '../BlockCrudComponent';

@Component
export default class RemoveBlockAction extends BlockCrudComponent {

  @Prop({ type: String, default: 'Remove Block' })
  readonly label!: string;

  @Prop({ type: String, default: 'delete' })
  readonly icon!: string;

  get itemProps() {
    return {
      ...this.$attrs,
      ...this.$props,
    };
  }

  get deletable() {
    return featureStore.deletersById(this.widget.feature).length > 0;
  }
}
</script>

<template>
  <ActionItem v-if="isStoreBlock && deletable" v-bind="itemProps" @click="startRemoveBlock" />
</template>
