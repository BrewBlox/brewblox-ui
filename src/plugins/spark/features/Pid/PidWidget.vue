<script lang="ts">
import { Component } from 'vue-property-decorator';

import { Link } from '@/helpers/bloxfield';
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

  get inputLink(): Link {
    return this.block.data.inputId;
  }

  get outputLink(): Link {
    return this.block.data.outputId;
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
        <CardWarning v-if="!inputLink.id">
          <template #message>
            PID has no input block configured.
          </template>
        </CardWarning>

        <CardWarning v-if="!outputLink.id">
          <template #message>
            PID has no output block configured.
          </template>
        </CardWarning>

        <template v-if="inputLink.id && outputLink.id">
          <CardWarning v-if="!block.data.active">
            <template #message>
              <span>
                PID is inactive:
                <i>{{ outputLink | link }}</i> will not be set.
              </span>
            </template>
          </CardWarning>
          <BlockEnableToggle
            :hide-enabled="mode === 'Basic'"
            :crud="crud"
          >
            <template #enabled>
              PID is enabled and driving <i>{{ outputLink | link }}</i>.
            </template>
            <template #disabled>
              PID is disabled and not driving <i>{{ outputLink | link }}</i>.
            </template>
          </BlockEnableToggle>
        </template>
      </template>
    </component>
  </GraphCardWrapper>
</template>
