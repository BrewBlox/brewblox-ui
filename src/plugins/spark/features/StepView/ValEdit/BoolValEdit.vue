<script lang="ts">
import Component from 'vue-class-component';

import ValEdit from './ValEdit';


@Component
export default class BoolValEdit extends ValEdit { }
</script>

<template>
  <q-toggle v-model="field" :disable="!editable"/>
</template>
