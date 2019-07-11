<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { BalancerBlock } from './types';

@Component
export default class BalancerForm extends BlockCrudComponent {
  readonly block!: BalancerBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar :crud="crud" @close="close" />
    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Note</q-item-label>
          <span>
            To power balance multiple analog actuators,
            set a balanced constraint on them with this block as target.
          </span>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
