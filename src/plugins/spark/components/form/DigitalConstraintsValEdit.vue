<script lang="ts">
import { Component } from 'vue-property-decorator';

import { prettifyConstraints } from '@/plugins/spark/helpers';

import ValEditBase from '../ValEditBase';


@Component
export default class DigitalConstraintsValEdit extends ValEditBase {
  get displayString(): string {
    return prettifyConstraints(this.field);
  }
}
</script>

<template>
  <div v-if="editable">
    <div v-if="!comparison" class="text-warning q-mb-sm">
      Values will replace all existing constraints on <i>{{ blockId }}</i>.
    </div>
    <DigitalConstraints
      v-model="field"
      v-bind="{serviceId}"
    />
  </div>
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ displayString }}
  </div>
</template>
