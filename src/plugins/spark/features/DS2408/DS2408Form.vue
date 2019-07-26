<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { DS2408Block, DS2408Id, ValveStartId } from './types';

@Component
export default class DS2408Form extends BlockCrudComponent {
  DS2408Id = DS2408Id;
  ValveStartId = ValveStartId;
  readonly block!: DS2408Block;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar :crud="crud" />
    <CardWarning v-if="!block.data.connected">
      <template #message>DS2408 is not connected.</template>
    </CardWarning>
    <ValveArray :crud="crud" :id-enum="DS2408Id" :name-enum="ValveStartId" />
    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Address</q-item-label>
          <InputField
            :value="block.data.address"
            title="Address"
            tag="big"
            @input="v => { block.data.address = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Connected</q-item-label>
          {{ block.data.connected ? 'Yes' : 'No' }}
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
