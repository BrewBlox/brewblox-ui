<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { DS2413Block } from './types';

@Component
export default class DS2413Full
  extends BlockCrudComponent<DS2413Block> {
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />
    <IoArray :crud="crud" />

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
