<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { Block, SetpointSensorPairBlock } from '@/plugins/spark/types';

import SetpointSensorPairBasic from './SetpointSensorPairBasic.vue';
import SetpointSensorPairFull from './SetpointSensorPairFull.vue';

@Component({
  components: {
    Basic: SetpointSensorPairBasic,
    Full: SetpointSensorPairFull,
  },
})
export default class SetpointSensorPairWidget
  extends BlockWidgetBase<SetpointSensorPairBlock> {

  get usedBy(): Block[] {
    if (!this.crud.isStoreBlock) {
      return [];
    }
    return this.sparkModule
      .blocks
      .filter(block => block.data.inputId?.id === this.blockId);
  }

  get unused(): boolean {
    return this.crud.isStoreBlock && this.usedBy.length === 0;
  }

  get formattedUsers(): string {
    return this.usedBy.map(v => `'${v.id}'`).join(' and ');
  }

  get enabledString(): string {
    if (this.usedBy.length > 0) {
      return `Setpoint is enabled and used by ${this.formattedUsers}.`;
    }
    else {
      return 'Setpoint is enabled and unused.';
    }
  }

  get disabledString(): string {
    if (this.usedBy.length > 0) {
      const verb = this.usedBy.length > 1 ? 'are' : 'is';
      return `Setpoint is disabled and therefore ${this.formattedUsers} ${verb} inactive.`;
    }
    else {
      return 'Setpoint is disabled and unused.';
    }
  }
}
</script>

<template>
  <GraphCardWrapper
    :show="inDialog"
    v-bind="{context}"
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
        <BlockEnableToggle
          :crud="crud"
          data-key="settingEnabled"
        >
          <template #enabled>
            {{ enabledString }}
          </template>
          <template #disabled>
            {{ disabledString }}
          </template>
        </BlockEnableToggle>
      </template>
    </component>
  </GraphCardWrapper>
</template>
