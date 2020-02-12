<script lang="ts">
import { Component } from 'vue-property-decorator';

import ValEditBase from '../ValEditBase';


@Component
export default class StateValEdit extends ValEditBase {
  get fieldString(): string {
    return this.field === 1 ? 'ON' : 'OFF';
  }
}
</script>

<template>
  <DigitalStateButton v-if="editable" v-model="field" />
  <div v-else>
    {{ fieldString }}
  </div>
</template>
