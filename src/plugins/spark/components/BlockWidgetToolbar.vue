<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';

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
  <WidgetToolbar :title="$props.field.widgetId" :subtitle="$props.field.displayName">
    <q-item-section v-if="graph" side>
      <BlockGraph :id="field.widgetId" :config="field.graphCfg" :change="v => field.graphCfg = v"/>
    </q-item-section>
    <q-item-section class="dense" side>
      <q-btn flat round dense icon="settings" @click="field.openModal"/>
    </q-item-section>
    <q-item-section class="dense" side>
      <q-btn flat round dense icon="refresh" @click="field.refreshBlock"/>
    </q-item-section>
  </WidgetToolbar>
</template>

<style scoped>
.dense {
  padding: 0px;
}
</style>
