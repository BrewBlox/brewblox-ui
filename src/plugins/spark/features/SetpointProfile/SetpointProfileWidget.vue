<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { SetpointProfileBlock } from './state';
import { getById } from './getters';

@Component
export default class SetpointProfileWidget extends BlockWidget {
  get block(): SetpointProfileBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: SetpointProfileBlock) {
    this.saveBlock(block);
  }

  asDate(timeS: number) {
    return new Date(timeS * 1000).toLocaleString();
  }
}
</script>

<template>
  <widget-card
    :title="$props.id"
    :subTitle="$props.type"
    :onRefresh="refreshBlock"
    form="SetpointProfileForm"
    v-model="block"
  >
    <widget-field
      label="Time > temperature"
    >
      <big
      v-for="(point, idx) in block.data.points"
      :key="idx"
      >
        {{ asDate(point.time) }} > {{ point.temperature | unit }}<br/>
      </big>
    </widget-field>
  </widget-card>
</template>

<style scoped>
</style>
