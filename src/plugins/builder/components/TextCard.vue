<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import PartCard from './PartCard';

@Component
export default class TextCard extends PartCard {

  @Prop({ type: String, default: 'text' })
  public readonly settingsKey!: string;


  @Prop({ type: String, default: 'Text field' })
  public readonly label!: string;

  get text(): string {
    return this.part.settings[this.settingsKey] || '';
  }

  set text(val: string) {
    this.savePartSettings({ ...this.part.settings, [this.settingsKey]: val });
  }
}
</script>

<template>
  <q-list dark>
    <q-separator dark />
    <q-item dark>
      <q-item-section>
        <q-item-label caption>{{ label }}</q-item-label>
        <InputField v-model="text" :title="label" />
      </q-item-section>
    </q-item>
  </q-list>
</template>
