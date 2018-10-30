<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { ActuatorAnalogMockBlock } from './state';
import { getById } from './getters';

@Component
export default class ActuatorAnalogMockWidget extends BlockWidget {
  get block(): ActuatorAnalogMockBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: ActuatorAnalogMockBlock) {
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
    form="ActuatorAnalogMockForm"
    v-model="block"
  >

    <widget-field
      label="Setting"
      icon=""
    >
      <big>{{ block.data.setting | round }}</big>
    </widget-field>

    <widget-field
      label="Value"
      icon=""
    >
      <big>{{ block.data.value | round }}</big>
    </widget-field>

  </widget-card>
</template>

<style scoped>
</style>

