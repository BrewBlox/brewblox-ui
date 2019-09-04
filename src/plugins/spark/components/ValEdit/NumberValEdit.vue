<script lang="ts">
import { Component } from 'vue-property-decorator';

import ValEdit from './ValEdit';


@Component
export default class NumberValEdit extends ValEdit { }
</script>

<template>
  <q-input v-if="editable" v-model.number="field" type="number" step="any" dark dense />
  <div v-else>
    {{ field }}
  </div>
</template>
