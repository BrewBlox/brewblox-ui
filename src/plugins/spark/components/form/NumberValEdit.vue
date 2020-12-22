<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';

import ValEditBase from '../ValEditBase';


@Component
export default class NumberValEdit extends ValEditBase {

  showKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      value: this.field,
      type: 'number',
    })
      .onOk(v => this.field = v);
  }
}
</script>

<template>
  <q-input
    v-if="editable"
    v-model.number="field"
    inputmode="numeric"
    pattern="[0-9]*"
    item-aligned
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
    {{ field }}
  </div>
</template>
