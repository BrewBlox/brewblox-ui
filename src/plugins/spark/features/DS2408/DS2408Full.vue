<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { DS2408Block, DS2408Id, ValveStartId } from './types';

@Component
export default class DS2408Full
  extends BlockCrudComponent<DS2408Block> {
  DS2408Id = DS2408Id;
  ValveStartId = ValveStartId;
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />
    <ValveArray :crud="crud" :id-enum="DS2408Id" :name-enum="ValveStartId" />

    <q-separator inset />

    <div class="widget-body row">
      <LabeledField
        :value="block.data.connected ? 'Yes' : 'No'"
        label="Connected"
        class="col-grow"
      />
      <InputField
        :value="block.data.address"
        title="Address"
        label="Address"
        class="col-grow"
        @input="v => { block.data.address = v; saveBlock(); }"
      />
    </div>
  </div>
</template>
