<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { blockValues } from '@/plugins/spark/store/getters';

@Component
export default class BlockFormToolbar extends BlockForm {
  get blockOptions() {
    return blockValues(this.$store, this.block.serviceId)
      .filter(block => block.type === this.block.type)
      .map(block => ({ label: block.id, value: block.id }));
  }
}
</script>

<template>
  <WidgetFormToolbar v-bind="$props">
    <q-icon name="mdi-cube"/>
    <SelectPopupEdit
      v-if="!$props.volatile && $props.onSwitchBlockId"
      :options="blockOptions"
      :field="block.id"
      :change="$props.onSwitchBlockId"
      label="Block"
      tag="span"
      class="text-h6 text-no-wrap"
    >Select a different block to be displayed by this widget.</SelectPopupEdit>
    <div v-else class="ellipsis text-no-wrap">{{ block.id }}</div>
  </WidgetFormToolbar>
</template>
