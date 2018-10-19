<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { getById } from './getters';

@Component
export default class InactiveObjectWidget extends BlockWidget {
}
</script>

<template>
  <widget-card
    :title="$props.id"
    :subTitle="$props.type"
    :onRefresh="refreshBlock"
    form="InactiveObjectForm"
    v-model="block"
  >

    <q-item>
      <q-list-header>This block is not in any active profile</q-list-header>
    </q-item>

  </widget-card>
</template>

<style scoped>
</style>
