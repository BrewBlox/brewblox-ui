<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { ActuatorPwmBlock } from './state';
import { getById } from './getters';

@Component
export default class ActuatorPwmWidget extends BlockWidget {
  get block(): ActuatorPwmBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: ActuatorPwmBlock) {
    this.saveBlock(block);
  }
}
</script>

<template>
  <widget-card
    :title="$props.id"
    :subTitle="$props.type"
    :onRefresh="refreshBlock"
    form="ActuatorPwmForm"
    v-model="block"
  >
    <widget-field
      :label="`Actuator (${block.data.actuatorId.id})`"
      :icon="block.data.actuatorValid ? 'link' : 'link_off'"
    >
      <big>Setting: {{ block.data.setting | round }}</big> <br/>
      <big>Value: {{ block.data.value | round }}</big>
    </widget-field>

    <widget-field
      label="Period"
    >
      <big>Period: {{ block.data.period }}</big>
    </widget-field>

    <widget-field
      label="Constraints"
    >
      <ReadonlyConstraints
        :serviceId="serviceId"
        v-model="block.data.constrainedBy"
      />
    </widget-field>
  </widget-card>
</template>

<style scoped>
</style>

