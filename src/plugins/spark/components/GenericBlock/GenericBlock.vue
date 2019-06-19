<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

@Component
export default class GenericBlock extends BlockWidget { }
</script>

<template>
  <q-card dark class="column">
    <q-card-title class="title-bar">
      <div class="ellipsis">{{ widget.id }}</div>
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>

    <q-card-main>
      <q-item dark>
        <pre>{{ block.data }}</pre>
      </q-item>
    </q-card-main>
  </q-card>
</template>

<style scoped>
.q-item {
  display: grid;
  grid-gap: 10px;
}
</style>
