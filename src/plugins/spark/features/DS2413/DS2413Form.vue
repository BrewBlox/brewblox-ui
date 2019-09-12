<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { DS2413Block } from './types';

@Component
export default class DS2413Form extends BlockCrudComponent {
  readonly block!: DS2413Block;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar :crud="crud" />
    <CardWarning v-if="!block.data.connected">
      <template #message>
        DS2413 is not connected.
      </template>
    </CardWarning>
    <IoArray :crud="crud" />
    <q-separator dark inset />

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>
            Address
          </q-item-label>
          <InputField
            :value="block.data.address"
            title="Address"
            tag="big"
            @input="v => { block.data.address = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Connected
          </q-item-label>
          {{ block.data.connected ? 'Yes' : 'No' }}
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
