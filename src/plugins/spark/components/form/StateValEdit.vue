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
  <div>
    <DigitalStateButton v-model="field" />
  </div>
</template>
