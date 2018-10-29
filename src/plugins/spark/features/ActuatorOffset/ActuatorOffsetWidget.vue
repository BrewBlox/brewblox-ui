<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { ActuatorOffsetBlock } from './state';
import { getById } from './getters';

@Component
export default class ActuatorOffsetWidget extends BlockWidget {
  get block(): ActuatorOffsetBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: ActuatorOffsetBlock) {
    this.saveBlock(block);
  }

  get settingOrValue() {
    return ['Setting', 'Value'][this.block.data.referenceSettingOrValue];
  }
}
</script>

<template>
  <widget-card
    :title="$props.id"
    :subTitle="$props.type"
    :onRefresh="refreshBlock"
    :additionalInfo="additionalInfo"
    form="ActuatorOffsetForm"
    v-model="block"
  >
    <widget-field
      :label="`Target (${block.data.targetId.id})`"
      :icon="block.data.targetValid ? 'link' : 'link_off'"
    >
      <big>Setting: {{ block.data.setting | round }}</big> <br/>
      <big>Value: {{ block.data.value | round }}</big>
    </widget-field>

    <widget-field
      :label="`Target (${block.data.referenceId.id})`"
      :icon="block.data.referenceValid ? 'link' : 'link_off'"
    >
      <big>Setting or value: {{ settingOrValue }}</big>
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

