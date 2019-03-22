<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById, getClients } from './getters';
import { BalancerBlock } from './state';

@Component
export default class BalancerWidget extends BlockWidget {
  get block(): BalancerBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get clientNames() {
    return getClients(this.$store, this.serviceId, this.blockId);
  }

  clientName(id: number) {
    return this.clientNames[id] || id || 'unknown';
  }

  get renamedTargets() {
    return this.block.data.clients
      .reduce(
        (acc, client, idx) => ({
          ...acc,
          [`clients/${idx}/requested`]: `${this.clientName(client.id)} requested`,
          [`clients/${idx}/granted`]: `${this.clientName(client.id)} granted`,
        }),
        {},
    );
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <BalancerForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
        :on-switch-block-id="switchBlockId"
      />
    </q-dialog>

    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
      <q-item dark>
        <q-item-section>Client</q-item-section>
        <q-item-section>Granted</q-item-section>
        <q-item-section>Requested</q-item-section>
      </q-item>
      <q-item v-for="client in block.data.clients" :key="client.id.id" dark>
        <q-item-section>
          <i>{{ clientName(client.id) }}</i>
        </q-item-section>
        <q-item-section>{{ client.granted | round }}</q-item-section>
        <q-item-section>{{ client.requested | round }}</q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
