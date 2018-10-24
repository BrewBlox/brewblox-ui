<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { BalancerBlock } from './state';
import { getById } from './getters';

@Component
export default class BalancerWidget extends BlockWidget {
  get block(): BalancerBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: BalancerBlock) {
    this.saveBlock(block);
  }
}
</script>

<template>
  <widget-card
    :title="$props.id"
    :subTitle="$props.type"
    :onRefresh="refreshBlock"
    form="BalancerForm"
    v-model="block"
  >
    <widget-field
      label="Client granted / requested"
      v-for="(client, idx) in block.data.clients"
      :key="idx"
    >
      <big>{{ client.granted }} / {{ client.requested }}</big>
    </widget-field>
  </widget-card>
</template>

<style scoped>
</style>

