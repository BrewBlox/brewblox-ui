<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';

@Component
export default class GenericBlock extends BlockWidget { }
</script>

<template>
  <q-card dark class="column">
    <q-card-title class="title-bar">
      <InputPopupEdit
        :field="widgetId"
        :change="v => widgetId = v"
        label="Widget ID"
        display="span"
      />
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>

    <q-card-main>
      <q-item>
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
