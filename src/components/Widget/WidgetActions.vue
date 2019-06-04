<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import ItemBase from '@/components/ItemBase';


@Component
export default class WidgetActions extends Vue {
  @Prop({ type: Object, required: true })
  readonly field!: ItemBase;
}
</script>

<template>
  <q-expansion-item label="Widget Actions">
    <q-list dark>
      <slot name="widget-actions"/>
      <ActionItem icon="file_copy" label="Copy to widget" @click="field.copyWidget"/>
      <ActionItem v-if="!field.volatile" icon="exit_to_app" label="Move" @click="field.moveWidget"/>
      <ActionItem v-if="!field.volatile" icon="delete" label="Delete" @click="field.deleteWidget"/>
    </q-list>
  </q-expansion-item>
</template>
