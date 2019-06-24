<script lang="ts">
import { Component } from 'vue-property-decorator';

import { postfixedDisplayNames } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { SetpointSensorPairBlock } from './types';

@Component
export default class SetpointSensorPairWidget extends BlockWidget {
  readonly block!: SetpointSensorPairBlock;

  get renamedTargets() {
    return postfixedDisplayNames(
      {
        setting: 'Setting',
        value: 'Sensor value',
      },
      this.block.data,
    );
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" :graph-cfg="graphCfg"/>

    <q-card-section>
      <q-item dark>
        <q-item-section class="col-3" style="justify-content: flex-start">
          <q-item-label caption>Setting</q-item-label>
          <UnitField
            :class="{darkened: !block.data.settingEnabled}"
            :value="block.data.storedSetting"
            :readonly="isDriven"
            title="Setting"
            tag="big"
            @input="v => {block.data.storedSetting = v; saveBlock()}"
          />
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
        </q-item-section>
        <q-item-section class="col-3" style="justify-content: flex-start">
          <q-item-label caption>Enabled</q-item-label>
          <q-toggle
            :value="block.data.settingEnabled"
            :disable="isDriven"
            @input="v => { block.data.settingEnabled = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section class="col-6" style="justify-content: flex-start">
          <q-item-label caption>Sensor value</q-item-label>
          <UnitField :value="block.data.value" tag="big" readonly/>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
