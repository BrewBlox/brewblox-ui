<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { DisplayNames } from '@/store/history';


@Component
export default class LabelSelector extends Vue {
  @Prop({ type: Array, required: true })
  readonly selected!: string[];

  @Prop({ type: Object, required: true })
  readonly renames!: DisplayNames;

  get labels() {
    return { ...this.renames };
  }

  callAndSaveLabels(func: (v: any) => void) {
    return v => { func(v); this.$emit('update:renames', this.labels); };
  }
}
</script>

<template>
  <q-list dark>
    <q-item dark>
      <q-item-section>Metric</q-item-section>
      <q-item-section>Display as</q-item-section>
    </q-item>
    <q-separator dark inset/>
    <q-item v-for="field in selected" :key="field" dark>
      <q-item-section>{{ field }}</q-item-section>
      <q-item-section>
        <InputPopupEdit
          :field="labels[field]"
          :change="callAndSaveLabels(v => labels[field] = v)"
          label="Legend"
          clearable
          tag="span"
        />
      </q-item-section>
    </q-item>
    <q-item v-if="!selected.length" dark>
      <q-item-section>No metrics selected</q-item-section>
    </q-item>
  </q-list>
</template>
