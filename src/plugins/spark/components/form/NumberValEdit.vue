<script lang="ts">
import { Component } from 'vue-property-decorator';

import ValEditBase from '../ValEditBase';


@Component
export default class NumberValEdit extends ValEditBase { }
</script>

<template>
  <q-input v-if="editable" v-model.number="field" type="number" step="any" dark dense />
  <div v-else>
    {{ field }}
  </div>
</template>
