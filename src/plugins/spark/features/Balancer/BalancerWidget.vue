<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { getClients } from './getters';
import { BalancerBlock } from './types';

@Component
export default class BalancerWidget extends BlockWidget {
  readonly block!: BalancerBlock;

  get clientNames() {
    return getClients(this.serviceId, this.blockId);
  }

  clientName(id: number) {
    return this.clientNames[id] || id || 'unknown';
  }

  // TODO: implement
  // get renamedTargets() {
  //   return this.block.data.clients
  //     .reduce(
  //       (acc, client, idx) => ({
  //         ...acc,
  //         [`clients/${idx}/requested`]: `${this.clientName(client.id)} requested`,
  //         [`clients/${idx}/granted`]: `${this.clientName(client.id)} granted`,
  //       }),
  //       {},
  //     );
  // }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" />

    <q-card-section>
      <q-item dark dense style="opacity: 0.5">
        <q-item-section>Client</q-item-section>
        <q-item-section>Granted</q-item-section>
        <q-item-section>Requested</q-item-section>
      </q-item>
      <q-list dense>
        <q-item v-for="client in block.data.clients" :key="client.id.id" dark>
          <q-item-section>
            <i>{{ clientName(client.id) }}</i>
          </q-item-section>
          <q-item-section>{{ client.granted | round }}</q-item-section>
          <q-item-section>{{ client.requested | round }}</q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>
