<script lang="ts">
import Component from 'vue-class-component';

import ValEdit from './ValEdit';


@Component
export default class StateValEdit extends ValEdit {
  get fieldString() {
    return this.field === 1 ? 'ON' : 'OFF';
  }
}
</script>

<template>
  <ActuatorState v-if="editable" :field="field" :change="saveField"/>
  <div v-else>{{ fieldString }}</div>
</template>
