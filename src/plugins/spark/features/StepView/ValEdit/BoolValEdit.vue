<script lang="ts">
import { Component } from 'vue-property-decorator';

import ValEdit from './ValEdit';


@Component
export default class BoolValEdit extends ValEdit { }
</script>

<template>
  <q-toggle v-model="field" :disable="!editable"/>
</template>
