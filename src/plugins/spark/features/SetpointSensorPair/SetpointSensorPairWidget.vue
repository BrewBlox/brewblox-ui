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
        value: 'Sensor',
        valueUnfiltered: 'Sensor unfiltered',
      },
      this.block.data,
    );
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" :graph-cfg.sync="graphCfg" />

    <q-card-section>
      <template v-if="!block.data.settingEnabled">
        <q-item dark>
          <q-item-section avatar>
            <q-icon name="warning"/>
          </q-item-section>
          <q-item-section>Setpoint is disabled.</q-item-section>
          <q-item-section side>
            <q-btn
              text-color="white"
              flat
              label="Enable"
              @click="block.data.settingEnabled = true; saveBlock()"
            />
          </q-item-section>
        </q-item>
        <q-separator dark inset class="q-mb-md"/>
      </template>

      <q-item dark>
        <q-item-section class="q-mr-md">
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
        <q-item-section class="q-mr-md">
          <q-item-label caption>Sensor</q-item-label>
          <UnitField :value="block.data.value" tag="big" readonly/>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-item-label caption>Unfiltered sensor</q-item-label>
          <UnitField :value="block.data.valueUnfiltered" tag="big" readonly/>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
