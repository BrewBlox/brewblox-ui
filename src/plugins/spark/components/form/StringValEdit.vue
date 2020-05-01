<script lang="ts">
import { Component } from 'vue-property-decorator';

import ValEditBase from '../ValEditBase';


@Component
export default class StringValEdit extends ValEditBase {
  get displayValue(): string {
    return this.field || '<not set>';
  }
}
</script>

<template>
  <q-input v-if="editable" v-model="field" dense />
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ displayValue }}
  </div>
</template>
