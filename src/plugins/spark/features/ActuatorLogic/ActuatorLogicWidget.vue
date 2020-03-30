<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import ActuatorLogicBasic from './ActuatorLogicBasic.vue';
import ActuatorLogicFull from './ActuatorLogicFull.vue';
import { ActuatorLogicBlock } from './types';

@Component({
  components: {
    Basic: ActuatorLogicBasic,
    Full: ActuatorLogicFull,
  },
})
export default class ActuatorLogicWidget
  extends BlockWidgetBase<ActuatorLogicBlock> {

  enable(): void {
    this.block.data.enabled = true;
    this.saveBlock();
  }
}
</script>


<template>
  <GraphCardWrapper :show="inDialog" v-bind="{context}">
    <template #graph>
      <HistoryGraph :graph-id="widget.id" :config="graphCfg" :refresh-trigger="mode" />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <component :is="mode" :crud="crud">
      <template #warnings>
        <CardWarning v-if="!block.data.targetId.id">
          <template #message>
            Logic Actuator has no target actuator configured.
          </template>
        </CardWarning>
        <CardWarning v-else-if="!block.data.enabled">
          <template #message>
            <span>
              Logic Actuator is disabled:
              <i>{{ block.data.targetId }}</i> will not be changed.
            </span>
          </template>
          <template #actions>
            <q-btn text-color="white" flat label="Enable" @click="enable" />
          </template>
        </CardWarning>
        <BlockEnableToggle
          v-else
          :crud="crud"
          :text-enabled="`Offset is enabled: ${block.data.targetId} will be offset from the
          ${block.data.referenceSettingOrValue == 0 ? 'setting' : 'value'} of ${block.data.referenceId}.`"
          :text-disabled="`Offset is disabled: ${block.data.targetId} will not be changed.`"
        />
      </template>
    </component>
  </GraphCardWrapper>
</template>
