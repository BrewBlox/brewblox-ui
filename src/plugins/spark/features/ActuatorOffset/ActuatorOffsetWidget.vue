<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import ActuatorOffsetBasic from './ActuatorOffsetBasic.vue';
import ActuatorOffsetFull from './ActuatorOffsetFull.vue';
import { ActuatorOffsetBlock } from './types';

@Component({
  components: {
    Basic: ActuatorOffsetBasic,
    Full: ActuatorOffsetFull,
  },
})
export default class ActuatorOffsetWidget
  extends BlockWidgetBase<ActuatorOffsetBlock> {

  enable(): void {
    this.block.data.enabled = true;
    this.saveBlock();
  }
}
</script>

<template>
  <GraphCardWrapper :show="inDialog">
    <template #graph>
      <HistoryGraph :graph-id="widget.id" :config="graphCfg" :refresh-trigger="mode" />
    </template>

    <component :is="mode" :crud="crud" :class="cardClass">
      <template #toolbar>
        <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
      </template>

      <template #warnings>
        <CardWarning v-if="!block.data.targetId.id">
          <template #message>
            Setpoint Driver has no target Setpoint configured.
          </template>
        </CardWarning>
        <CardWarning v-else-if="!block.data.referenceId.id">
          <template #message>
            Setpoint Driver has no reference Setpoint configured.
          </template>
        </CardWarning>
        <CardWarning v-else-if="!block.data.enabled">
          <template #message>
            <span>
              Setpoint Driver is disabled:
              <i>{{ block.data.targetId }}</i> will not be changed.
            </span>
          </template>
          <template #actions>
            <q-btn text-color="white" flat label="Enable" @click="enable" />
          </template>
        </CardWarning>
      </template>
    </component>
  </GraphCardWrapper>
</template>
