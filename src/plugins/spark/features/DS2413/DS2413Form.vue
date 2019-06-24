<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { DS2413Block, DS2413Id } from './types';

@Component
export default class DS2413Form extends BlockCrudComponent {
  DS2413Id = DS2413Id;
  readonly block!: DS2413Block;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar :crud="crud"/>

    <IoArray v-bind="$props" :id-enum="DS2413Id" v-on="$listeners"/>
    <q-separator dark inset/>

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
