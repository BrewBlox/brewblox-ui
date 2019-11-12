<script lang="ts">
import { Component } from 'vue-property-decorator';

import ValEditBase from '../ValEditBase';


@Component
export default class BoolValEdit extends ValEditBase { }
</script>

<template>
  <q-toggle v-model="field" :disable="!editable" />
</template>
