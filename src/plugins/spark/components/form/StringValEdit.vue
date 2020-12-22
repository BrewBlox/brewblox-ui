<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';

import ValEditBase from '../ValEditBase';


@Component
export default class StringValEdit extends ValEditBase {
  get displayValue(): string {
    return this.field || '<not set>';
  }


  showKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      value: this.field,
    })
      .onOk(v => this.field = v);
  }
}
</script>

<template>
  <q-input
    v-if="editable"
    v-model="field"
    dense
  >
    <template #append>
      <KeyboardButton @click="showKeyboard" />
    </template>
  </q-input>
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ displayValue }}
  </div>
</template>
