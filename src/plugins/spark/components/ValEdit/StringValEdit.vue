<script lang="ts">
import { Component } from 'vue-property-decorator';

import ValEdit from './ValEdit';


@Component
export default class StringValEdit extends ValEdit { }
</script>

<template>
  <q-input v-if="editable" v-model="field" dark dense/>
  <div v-else>{{ field }}</div>
</template>
