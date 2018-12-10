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
        label="Widget ID"
        display="span"
        :change="v => widgetId = v"
      />
      <span class="vertical-middle on-left" slot="right">{{ displayName }}</span>
      <q-btn flat round dense slot="right" @click="refreshBlock" icon="refresh"/>
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
