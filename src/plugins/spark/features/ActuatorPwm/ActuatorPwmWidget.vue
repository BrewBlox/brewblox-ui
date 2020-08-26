<script lang="ts">
import { Component } from 'vue-property-decorator';

import { Link } from '@/helpers/bloxfield';
import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { ActuatorPwmBlock } from '@/plugins/spark/types';

import ActuatorPwmBasic from './ActuatorPwmBasic.vue';
import ActuatorPwmFull from './ActuatorPwmFull.vue';

@Component({
  components: {
    Basic: ActuatorPwmBasic,
    Full: ActuatorPwmFull,
  },
})
export default class ActuatorPwmWidget
  extends BlockWidgetBase<ActuatorPwmBlock> {

  get outputLink(): Link {
    return this.block.data.actuatorId;
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
        <CardWarning v-if="!outputLink.id">
          <template #message>
            PWM has no target actuator configured.
          </template>
        </CardWarning>
        <BlockEnableToggle
          :hide-enabled="mode === 'Basic'"
          :crud="crud"
        >
          <template #enabled>
            PWM is enabled and driving <i>{{ outputLink | link }}</i>.
          </template>
          <template #disabled>
            PWM is disabled and not driving <i>{{ outputLink | link }}</i>.
          </template>
        </BlockEnableToggle>
      </template>
    </component>
  </GraphCardWrapper>
</template>
