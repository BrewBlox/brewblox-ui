<script lang="ts">
import { Component } from 'vue-property-decorator';

import ValEdit from './ValEdit';


@Component
export default class StateValEdit extends ValEdit {
  get fieldString() {
    return this.field === 1 ? 'ON' : 'OFF';
  }
}
</script>

<template>
  <ActuatorField v-if="editable" v-model="field"/>
  <div v-else>{{ fieldString }}</div>
</template>
