<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { TempSensorMockBlock } from './state';
import { getById } from './getters';

@Component
export default class TempSensorMockWidget extends BlockWidget {
  get block(): TempSensorMockBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: TempSensorMockBlock) {
    this.saveBlock(block);
  }
}
</script>

<template>
  <widget-card
    :title="$props.id"
    :subTitle="$props.type"
    :onRefresh="refreshBlock"
    :additionalInfo="additionalInfo"
    form="TempSensorMockForm"
    v-model="block"
  >

    <widget-field
      label="Address"
      :icon="block.data.valid ? 'link' : 'link_off'"
    >
      <big>{{ block.data.address }}</big>
    </widget-field>

    <widget-field
      label="Value"
      icon=""
    >
      <big>{{ block.data.value | unit }}</big>
    </widget-field>

  </widget-card>
</template>

<style scoped>
</style>
