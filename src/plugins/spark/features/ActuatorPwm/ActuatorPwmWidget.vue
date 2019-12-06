<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import ActuatorPwmBasic from './ActuatorPwmBasic.vue';
import ActuatorPwmFull from './ActuatorPwmFull.vue';
import { ActuatorPwmBlock } from './types';

@Component({
  components: {
    Basic: ActuatorPwmBasic,
    Full: ActuatorPwmFull,
  },
})
export default class ActuatorPwmWidget extends BlockWidgetBase {
  readonly block!: ActuatorPwmBlock;
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
