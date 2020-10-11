<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { DS2413Block } from '@/plugins/spark/types';

@Component
export default class DS2413Widget
  extends BlockWidgetBase<DS2413Block> {
}
</script>

<template>
  <CardWrapper
    v-bind="{context}"
  >
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <div class="widget-md">
      <CardWarning v-if="!block.data.connected">
        <template #message>
          DS2413 is not connected
        </template>
      </CardWarning>
      <IoArray :crud="crud" />

      <template v-if="mode === 'Full'">
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
      </template>
    </div>
  </CardWrapper>
</template>
