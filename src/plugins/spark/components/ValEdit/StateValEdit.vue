<script lang="ts">
import { Component } from 'vue-property-decorator';

import ValEdit from './ValEdit';


@Component
export default class StateValEdit extends ValEdit {
  get fieldString(): string {
    return this.field === 1 ? 'ON' : 'OFF';
  }
}
</script>

<template>
  <DigitalStateField v-if="editable" v-model="field" />
  <div v-else>
    {{ fieldString }}
  </div>
</template>
