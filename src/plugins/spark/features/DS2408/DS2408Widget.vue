<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { DS2408StartChannels } from '@/plugins/spark/getters';
import { DS2408Block } from '@/plugins/spark/types';

@Component
export default class DS2408Widget
  extends BlockWidgetBase<DS2408Block> {
  mapping = DS2408StartChannels;
}
</script>

<template>
  <CardWrapper
    v-bind="{context}"
    @dblclick="toggleMode"
  >
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <div class="widget-md">
      <CardWarning v-if="!block.data.connected">
        <template #message>
          DS2408 is not connected
        </template>
      </CardWarning>
      <ValveArray :crud="crud" :mapping="mapping" />

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
