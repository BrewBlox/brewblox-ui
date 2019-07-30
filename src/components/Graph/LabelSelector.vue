<script lang="ts">
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { DisplayNames } from '@/store/history';

import { defaultLabel } from './functional';


@Component
export default class LabelSelector extends Vue {
  @Prop({ type: Array, required: true })
  readonly selected!: string[];

  @Prop({ type: Object, required: true })
  readonly renames!: DisplayNames;

  @Emit('update:renames')
  saveLabels() {
    return this.labels;
  }

  get labels() {
    return { ...this.renames };
  }

  saveLabel(key: string, val: string | null) {
    this.labels[key] = val || defaultLabel(key);
    this.saveLabels();
  }
}
</script>

<template>
  <q-list dark>
    <q-item dark>
      <q-item-section>Metric</q-item-section>
      <q-item-section>Display as</q-item-section>
    </q-item>
    <q-separator dark inset />
    <q-item v-for="field in selected" :key="field" dark>
      <q-item-section>{{ field }}</q-item-section>
      <q-item-section>
        <InputField :value="labels[field]" title="Legend" @input="v => saveLabel(field, v)" />
      </q-item-section>
    </q-item>
    <q-item v-if="!selected.length" dark>
      <q-item-section>No metrics selected</q-item-section>
    </q-item>
  </q-list>
</template>
