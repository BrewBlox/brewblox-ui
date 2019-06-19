<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockForm from '@/plugins/spark/components/BlockForm';

import { DS2408Block, DS2408Id, ValveStartId } from './types';

@Component
export default class DS2408Form extends BlockForm {
  DS2408Id = DS2408Id;
  ValveStartId = ValveStartId;
  readonly block!: DS2408Block;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props" v-on="$listeners"/>

    <ValveArray v-bind="$props" :id-enum="DS2408Id" :name-enum="ValveStartId" v-on="$listeners"/>
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
