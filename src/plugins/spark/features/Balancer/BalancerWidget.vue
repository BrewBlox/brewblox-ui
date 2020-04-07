<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { sparkStore } from '@/plugins/spark/store';

import { BalancerBlock } from './types';

@Component
export default class BalancerWidget
  extends BlockWidgetBase<BalancerBlock> {

  get clientNames(): Mapped<string> {
    const result = {};
    sparkStore.serviceBlocks(this.serviceId)
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
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" />
    </template>

    <div class="widget-md column q-ma-md q-gutter-y-sm">
      <div class="col-auto row q-gutter-x-sm darkened">
        <div class="col">
          Client
        </div>
        <div class="col">
          Granted
        </div>
        <div class="col">
          Requested
        </div>
      </div>

      <div
        v-for="client in block.data.clients"
        :key="client.id.id"
        class="col-auto row q-gutter-x-sm"
      >
        <div class="col text-italic">
          {{ clientName(client.id) }}
        </div>
        <div class="col">
          {{ client.granted | round }}
        </div>
        <div class="col">
          {{ client.requested | round }}
        </div>
      </div>
    </div>
  </CardWrapper>
</template>
