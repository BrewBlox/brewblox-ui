<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { saveBlock } from '@/plugins/spark/store/actions';
import { SetpointSimpleBlock } from './state';
import { getById } from './getters';

@Component
export default class SetpointSimpleWidget extends BlockWidget {
  get block(): SetpointSimpleBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: SetpointSimpleBlock) {
    this.saveBlock(block);
  }

  get setting() {
    return this.block.data.setting;
  }
}
</script>

<template>
  <widget-card
    :title="$props.id"
    :subTitle="$props.type"
    :onRefresh="refreshBlock"
    :additionalInfo="additionalInfo"
    form="SetpointSimpleForm"
    v-model="block"
  >

    <widget-field
      label="Setting"
      icon="devices"
    >
      <big>{{ setting | unit }}</big>
    </widget-field>

  </widget-card>
</template>

<style scoped>
</style>
