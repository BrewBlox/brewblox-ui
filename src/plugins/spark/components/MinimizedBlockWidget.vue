<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';

@Component
export default class MinimizedBlockWidget extends BlockWidget { }
</script>

<template>
  <q-item class="bg-dark text-white" style="min-width: 500px">
    <q-item-section avatar>
      <q-icon name="mdi-cube"/>
    </q-item-section>
    <q-item-section>{{ widgetTitle }}</q-item-section>
    <q-item-section side>{{ displayName }}</q-item-section>
  </q-item>
</template>
