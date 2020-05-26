<script lang="ts">
import { Component } from 'vue-property-decorator';

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
}
</script>

<template>
  <GraphCardWrapper :show="inDialog" v-bind="{context}">
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
        <CardWarning v-if="!block.data.actuatorId.id">
          <template #message>
            PWM has no target actuator configured.
          </template>
        </CardWarning>
        <CardWarning v-else-if="!block.data.enabled">
          <template #message>
            <span>
              PWM is disabled:
              <i>{{ block.data.actuatorId }}</i> will not be toggled.
            </span>
          </template>
          <template #actions>
            <q-btn
              text-color="white"
              flat
              label="Enable"
              @click="block.data.enabled = true; saveBlock();"
            />
          </template>
        </CardWarning>
      </template>
    </component>
  </GraphCardWrapper>
</template>
