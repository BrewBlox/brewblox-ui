<script lang="ts">
import { Component } from 'vue-property-decorator';

import ValEditBase from '../ValEditBase';


@Component
export default class NumberValEdit extends ValEditBase { }
</script>

<template>
  <q-input
    v-if="editable"
    v-model.number="field"
    inputmode="numeric"
    pattern="[0-9]*"
    dense
  />
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ field }}
  </div>
</template>
