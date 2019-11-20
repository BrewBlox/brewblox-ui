<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

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

  get usedBy(): Block[] {
    if (!this.crud.isStoreBlock) {
      return [];
    }
    return sparkStore.blockValues(this.serviceId)
      .filter(block => get(block, 'data.inputId.id') === this.blockId);
  }

  get unused(): boolean {
    return this.crud.isStoreBlock && this.usedBy.length === 0;
  }

  get disabledString(): string {
    if (this.usedBy.length > 1) {
      return `This setpoint is disabled and therefore ${this.usedBy.map(v => `'${v.id}'`).join(' and ')} are inactive.`;
    } else if (this.usedBy.length === 1) {
      return `This setpoint is disabled and therefore '${this.usedBy[0].id}' is inactive.`;
    } else {
      return 'This setpoint is disabled and is not used.';
    }
  }
}
</script>

<template>
  <GraphCardWrapper :show="inDialog">
    <template #graph>
      <HistoryGraph :graph-id="widget.id" :config="graphCfg" />
    </template>

    <component :is="mode" :crud="crud" :class="cardClass">
      <template #toolbar>
        <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
      </template>

      <template #warnings>
        <CardWarning v-if="unused">
          <template #message>
            This Setpoint is not used as PID input.
          </template>
        </CardWarning>
        <BlockEnableToggle
          v-else
          :crud="crud"
          :text-disabled="disabledString"
          text-enabled="Setpoint is enabled."
          data-key="settingEnabled"
          class="full-width bordered"
        />
      </template>
    </component>
  </GraphCardWrapper>
</template>
