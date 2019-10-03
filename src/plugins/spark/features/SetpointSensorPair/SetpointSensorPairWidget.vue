<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { sparkStore } from '../../store';
import SetpointSensorPairBasic from './SetpointSensorPairBasic.vue';
import SetpointSensorPairFull from './SetpointSensorPairFull.vue';
import { SetpointSensorPairBlock } from './types';

@Component({
  components: {
    Basic: SetpointSensorPairBasic,
    Full: SetpointSensorPairFull,
  },
})
export default class SetpointSensorPairWidget extends BlockWidgetBase {
  readonly block!: SetpointSensorPairBlock;

  get isUsed(): boolean {
    return sparkStore.blockValues(this.serviceId)
      .some(block => get(block, 'data.inputId.id') === this.blockId);
  }
}
</script>

<template>
  <GraphCardWrapper :show="inDialog">
    <template #graph>
      <HistoryGraph :id="widget.id" :config="graphCfg" />
    </template>

    <component :is="mode" :crud="crud" :class="cardClass">
      <template #toolbar>
        <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
      </template>

      <template #warnings>
        <CardWarning v-if="!isUsed">
          <template #message>
            This Setpoint is not used as PID input.
          </template>
        </CardWarning>
        <CardWarning v-else-if="!block.data.settingEnabled">
          <template #message>
            <span>This setpoint is disabled.</span>
          </template>
          <template #actions>
            <q-btn
              text-color="white"
              flat
              label="Enable"
              @click="block.data.settingEnabled = true; saveBlock();"
            />
          </template>
        </CardWarning>
      </template>
    </component>
  </GraphCardWrapper>
</template>
