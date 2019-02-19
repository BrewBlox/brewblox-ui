<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { blockValues } from '@/plugins/spark/store/getters';

@Component
export default class BlockWidgetSettings extends BlockForm {
  get blockOptions() {
    return blockValues(this.$store, this.block.serviceId)
      .filter(block => block.type === this.block.type)
      .map(block => ({ label: block.id, value: block.id }));
  }


}
</script>

<template>
  <WidgetSettings v-bind="$props" slot-icon="mdi-cube">
    <SelectPopupEdit
      v-if="!$props.volatile && $props.onSwitchBlockId"
      :options="blockOptions"
      :field="block.id"
      :change="$props.onSwitchBlockId"
      label="Block"
      display="span"
    >Select a different block to be displayed by this widget.</SelectPopupEdit>
    <span v-else>{{ block.id }}</span>
  </WidgetSettings>
</template>
