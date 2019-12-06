<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import PidBasic from './PidBasic.vue';
import PidFull from './PidFull.vue';
import { startRelationsDialog } from './relations';
import { PidBlock } from './types';

@Component({
  components: {
    Basic: PidBasic,
    Full: PidFull,
  },
})
export default class PidWidget extends BlockWidgetBase {
  readonly block!: PidBlock;

  get inputId(): string | null {
    return this.block.data.inputId.id;
  }

  get outputId(): string | null {
    return this.block.data.outputId.id;
  }

  enable(): void {
    this.block.data.enabled = true;
    this.saveBlock();
  }

  showRelations(): void {
    startRelationsDialog(this.block);
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
        <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
          <template #actions>
            <ActionItem icon="mdi-vector-line" label="Show Relations" @click="showRelations" />
          </template>
        </component>
      </template>

      <template #warnings>
        <CardWarning v-if="!outputId">
          <template #message>
            PID has no output Block configured.
          </template>
        </CardWarning>
        <CardWarning v-if="!inputId">
          <template #message>
            PID has no input Block configured.
          </template>
        </CardWarning>
        <CardWarning v-else-if="!block.data.enabled">
          <template #message>
            <span>
              PID is disabled:
              <i>{{ block.data.outputId }}</i> will not be set.
            </span>
          </template>
          <template #actions>
            <q-btn text-color="white" flat label="Enable" @click="enable" />
          </template>
        </CardWarning>
        <CardWarning v-else-if="!block.data.active">
          <template #message>
            <span>
              PID is inactive:
              <i>{{ block.data.outputId }}</i> will not be set.
            </span>
          </template>
        </CardWarning>
      </template>
    </component>
  </GraphCardWrapper>
</template>
