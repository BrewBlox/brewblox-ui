<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { SetpointSensorPairBlock } from './state';
import { getById } from './getters';

@Component
export default class SetpointSensorPairWidget extends BlockWidget {
  get block(): SetpointSensorPairBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: SetpointSensorPairBlock) {
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
    form="SetpointSensorPairForm"
    v-model="block"
  >

    <widget-field
      :label="`Setpoint (${block.data.setpointId.id})`"
      :icon="block.data.setpointValid ? 'link' : 'link_off'"
    >
      <big>{{ block.data.setpointValue | unit }}</big>
    </widget-field>

    <widget-field
      :label="`Sensor (${block.data.sensorId.id})`"
      :icon="block.data.sensorValid ? 'link' : 'link_off'"
    >
      <big>{{ block.data.sensorValue | unit }}</big>
    </widget-field>

  </widget-card>
</template>

<style scoped>
</style>

