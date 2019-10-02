<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { TempSensorOneWireBlock } from './types';

@Component
export default class TempSensorOneWireForm extends BlockCrudComponent {
  readonly block!: TempSensorOneWireBlock;
}
</script>

<template>
  <GraphCardWrapper>
    <template #graph>
      <HistoryGraph :id="widget.id" :config="graphCfg" />
    </template>

    <q-card dark class="widget-modal">
      <BlockWidgetDialogToolbar :crud="crud" />
      <CardWarning v-if="block.data.value.val === null">
        <template #message>
          OneWire Sensor could not be read.
        </template>
      </CardWarning>

      <q-card-section>
        <q-item dark>
          <q-item-section class="col-6">
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
              Offset
            </q-item-label>
            <UnitField
              :value="block.data.offset"
              title="Offset"
              tag="big"
              @input="v => { block.data.offset = v; saveBlock(); }"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>
              Value
            </q-item-label>
            <UnitField :value="block.data.value" readonly tag="big" />
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>
  </graphcardwrapper>
</template>
