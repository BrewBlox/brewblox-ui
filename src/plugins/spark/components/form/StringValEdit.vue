<script lang="ts">
import { Component } from 'vue-property-decorator';

import ValEditBase from '../ValEditBase';


@Component
export default class StringValEdit extends ValEditBase { }
</script>

<template>
  <q-input v-if="editable" v-model="field" dark dense />
  <div v-else>
    {{ field }}
  </div>
</template>
