<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartCard from './PartCard';

@Component
export default class TextCard extends PartCard {

  get text(): string {
    return this.part.settings.text || '';
  }

  set text(text: string) {
    this.savePartSettings({ ...this.part.settings, text });
  }
}
</script>

<template>
  <q-list dark>
    <q-separator dark/>
    <q-item dark>
      <q-item-section>
        <q-item-label caption>Text field</q-item-label>
        <InputField v-model="text" title="Text field"/>
      </q-item-section>
    </q-item>
  </q-list>
</template>
