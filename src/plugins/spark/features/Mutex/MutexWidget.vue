<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById, getMutexClients } from './getters';
import { MutexBlock } from './state';

@Component
export default class MutexWidget extends BlockWidget {
  get block(): MutexBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get mutexClients() {
    return getMutexClients(this.$store, this.serviceId, this.blockId);
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <MutexForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
        :on-switch-block-id="switchBlockId"
      />
    </q-dialog>

    <BlockWidgetToolbar :field="me"/>

    <q-card-section>
      <q-item dark>
        <q-item-section>Held by</q-item-section>
        <q-item-section>{{ mutexClients.active }}</q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>Waiting</q-item-section>
        <q-item-section>
          <div class="column">
            <span v-for="client in mutexClients.waiting" :key="client">{{ client }}</span>
          </div>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>Idle</q-item-section>
        <q-item-section>
          <div class="column">
            <span v-for="client in mutexClients.idle" :key="client">{{ client }}</span>
          </div>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>Wait time remaining</q-item-section>
        <q-item-section>{{ block.data.waitRemaining | unitDuration }}</q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
