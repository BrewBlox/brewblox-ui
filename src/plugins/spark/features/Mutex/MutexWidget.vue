<script lang="ts">
import Component from 'vue-class-component';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { getById, getMutexClients } from './getters';
import { MutexBlock } from './types';

@Component
export default class MutexWidget extends BlockWidget {
  get block(): MutexBlock {
    return getById(this.serviceId, this.blockId);
  }

  get mutexClients() {
    return getMutexClients(this.serviceId, this.blockId);
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <MutexForm v-if="modalOpen" v-bind="formProps"/>
    </q-dialog>

    <BlockWidgetToolbar :field="me"/>

    <q-card-section>
      <q-item dark>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Held by</q-item-label>
          <div>{{ mutexClients.active }}</div>
        </q-item-section>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Waiting</q-item-label>
          <div v-for="client in mutexClients.waiting" :key="client">{{ client }}</div>
        </q-item-section>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Idle</q-item-label>
          <div v-for="client in mutexClients.idle" :key="client">{{ client }}</div>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Wait time remaining</q-item-label>
          <div>{{ block.data.waitRemaining | unitDuration }}</div>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
