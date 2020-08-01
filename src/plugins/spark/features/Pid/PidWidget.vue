<script lang="ts">
import { Component } from 'vue-property-decorator';

import { bloxLink, JSLink } from '@/helpers/bloxfield';
import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { PidBlock } from '@/plugins/spark/types';

import PidBasic from './PidBasic.vue';
import PidFull from './PidFull.vue';
import { startRelationsDialog } from './relations';

@Component({
  components: {
    Basic: PidBasic,
    Full: PidFull,
  },
})
export default class PidWidget
  extends BlockWidgetBase<PidBlock> {

  get inputBlock(): JSLink {
    return bloxLink(this.block.data.inputId);
  }

  get outputBlock(): JSLink {
    return bloxLink(this.block.data.outputId);
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
  <GraphCardWrapper :show="inDialog" v-bind="{context}">
    <template #graph>
      <HistoryGraph
        :graph-id="widget.id"
        :config="graphCfg"
        :refresh-trigger="mode"
        use-range
        use-presets
        @params="saveGraphParams"
        @layout="saveGraphLayout"
      />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ActionItem icon="mdi-vector-line" label="Relations" @click="showRelations" />
        </template>
      </component>
    </template>

    <component :is="mode" :crud="crud">
      <template #warnings>
        <CardWarning v-if="!outputBlock.id">
          <template #message>
            PID has no output block configured.
          </template>
        </CardWarning>
        <CardWarning v-if="!inputBlock.id">
          <template #message>
            PID has no input block configured.
          </template>
        </CardWarning>
        <CardWarning v-else-if="!block.data.enabled && mode !== 'Full'">
          <template #message>
            <span>
              PID is disabled:
              <i>{{ outputBlock }}</i> will not be set.
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
              <i>{{ outputBlock }}</i> will not be set.
            </span>
          </template>
        </CardWarning>
      </template>
    </component>
  </GraphCardWrapper>
</template>
