<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { TempSensorOneWireBlock } from './state';
import { getById } from './getters';

@Component
export default class TempSensorOneWireWidget extends BlockWidget {
  modalOpen: boolean = false;

  get block(): TempSensorOneWireBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: TempSensorOneWireBlock) {
    this.saveBlock(block);
  }
}
</script>

<template>
  <widget-card
    :title="$props.id"
    :subTitle="$props.type"
    :onRefresh="refreshBlock"
    form="TempSensorOneWireForm"
    v-model="block"
  >

    <widget-field
      label="Address"
      icon=""
    >
      <big>{{ block.data.address }}</big>
    </widget-field>

    <widget-field
      label="Valid"
      icon=""
    >
      <big>{{ block.data.valid }}</big>
    </widget-field>

    <widget-field
      label="Value"
      icon=""
    >
      <big>{{ block.data.value | unit }}</big>
    </widget-field>

    <widget-field
      label="Offset"
      icon=""
    >
      <big>{{ block.data.offset | unit }}</big>
    </widget-field>

  </widget-card>
</template>

<style scoped>
</style>
