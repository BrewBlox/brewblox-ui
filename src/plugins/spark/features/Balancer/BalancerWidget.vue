<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { sparkStore } from '../../store';
import { BalancerBlock } from './types';

@Component
export default class BalancerWidget extends BlockWidgetBase {
  readonly block!: BalancerBlock;

  get clientNames(): Mapped<string> {
    const result = {};
    sparkStore.blockValues(this.serviceId)
      .forEach((block) => {
        const constraint = get(block, 'data.constrainedBy.constraints', [])
          .find(constraint => get(constraint, 'balanced.balancerId.id') === this.blockId);
        if (constraint) {
          result[constraint.balanced.id] = block.id;
        }
      });
    return result;
  }

  clientName(id: number): string {
    return this.clientNames[id] || `${id}` || 'unknown';
  }
}
</script>

<template>
  <q-card :class="cardClass">
    <component :is="toolbarComponent" :crud="crud" />

    <q-card-section>
      <q-item dense style="opacity: 0.5">
        <q-item-section>Client</q-item-section>
        <q-item-section>Granted</q-item-section>
        <q-item-section>Requested</q-item-section>
      </q-item>
      <q-list dense>
        <q-item v-for="client in block.data.clients" :key="client.id.id">
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
