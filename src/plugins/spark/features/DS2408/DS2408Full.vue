<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { DS2408Block, DS2408Id, ValveStartId } from './types';

@Component
export default class DS2408Full extends BlockCrudComponent {
  DS2408Id = DS2408Id;
  ValveStartId = ValveStartId;
  readonly block!: DS2408Block;
}
</script>

<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <ValveArray :crud="crud" :id-enum="DS2408Id" :name-enum="ValveStartId" />
    <q-separator dark inset />

    <q-card-section>
      <q-item dark>
        <q-item-section class="col-grow">
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
