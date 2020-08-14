<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { ActuatorLogicBlock, Link } from '@/plugins/spark/types';

import ActuatorLogicBasic from './ActuatorLogicBasic.vue';
import ActuatorLogicFull from './ActuatorLogicFull.vue';

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

  get target(): Link {
    return this.block.data.targetId;
  }
}
</script>


<template>
  <GraphCardWrapper
    :show="inDialog"
    v-bind="{context}"
    @dblclick="toggleMode"
  >
    <template #graph>
      <HistoryGraph
        :graph-id="widget.id"
        :config="graphCfg"
        :refresh-trigger="mode"
        use-presets
        use-range
        @params="saveGraphParams"
        @layout="saveGraphLayout"
      />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <component :is="mode" :crud="crud">
      <template #warnings>
        <CardWarning v-if="!target.id">
          <template #message>
            Logic Actuator has no target actuator configured.
          </template>
        </CardWarning>
        <BlockEnableToggle
          v-else
          :crud="crud"
          :hide-enabled="mode === 'Basic'"
        >
          <template #enabled>
            Logic Actuator is enabled and driving <i>{{ target | link }}</i>.
          </template>
          <template #disabled>
            Logic Actuator is disabled and not driving <i>{{ target | link }}</i>.
          </template>
        </BlockEnableToggle>
      </template>
    </component>
  </GraphCardWrapper>
</template>
