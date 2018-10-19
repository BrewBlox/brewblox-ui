<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { ActuatorPinBlock } from './state';
import { getById, state } from './getters';

@Component
export default class ActuatorPinWidget extends BlockWidget {
  get block(): ActuatorPinBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: ActuatorPinBlock) {
    this.saveBlock(block);
  }

  get actuatorState() {
    return state[this.block.data.state];
  }
}
</script>

<template>
  <widget-card
    :title="$props.id"
    :subTitle="$props.type"
    :onRefresh="refreshBlock"
    form="ActuatorPinForm"
    v-model="block"
  >

    <widget-field
      label="State"
    >
      <big>{{ actuatorState }}</big>
    </widget-field>

    <widget-field
      label="Pin"
    >
      <big>{{ block.data.pin }}</big>
    </widget-field>

    <widget-field
      label="Inverted"
    >
      <big>{{ block.data.invert }}</big>
    </widget-field>

    <widget-field
      label="Constraints"
    >
      <constraints
        readonly
        type="digital"
        :serviceId="serviceId"
        v-model="block.data.constrainedBy"
      />
    </widget-field>

  </widget-card>
</template>

<style scoped>
</style>

