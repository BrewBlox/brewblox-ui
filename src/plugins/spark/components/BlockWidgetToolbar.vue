<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import BlockWidget from './BlockWidget';

@Component({
  props: {
    field: {
      type: Object,
      required: true,
    },
    graph: {
      type: Boolean,
      default: false,
    },
  },
})
export default class BlockWidgetToolbar extends Vue { }
</script>

<template>
  <q-card-section class="q-pa-xs">
    <q-item dark>
      <q-item-section>
        <q-item-label class="ellipsis text-h6">{{ field.widgetId }}</q-item-label>
      </q-item-section>
      <q-item-section side>{{ field.displayName }}</q-item-section>
      <q-item-section v-if="graph" side>
        <BlockGraph
          :id="field.widgetId"
          :config="field.graphCfg"
          :change="v => field.graphCfg = v"
        />
      </q-item-section>
      <q-item-section side>
        <q-btn flat round dense icon="settings" @click="field.openModal"/>
      </q-item-section>
      <q-item-section side>
        <q-btn flat round dense icon="refresh" @click="field.refreshBlock"/>
      </q-item-section>
    </q-item>
    <q-separator dark inset/>
  </q-card-section>
</template>
