<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { MutexBlock } from './state';
import { getById } from './getters';

@Component
export default class MutexWidget extends BlockWidget {
  get block(): MutexBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: MutexBlock) {
    this.saveBlock(block);
  }
}
</script>

<template>
  <widget-card
    :title="$props.id"
    :subTitle="$props.type"
    :onRefresh="refreshBlock"
    form="MutexForm"
    v-model="block"
  >

    <widget-field
      label="Different actuator wait"
    >
      <big>{{ block.data.differentActuatorWait }}</big>
    </widget-field>

  </widget-card>
</template>

<style scoped>
</style>

