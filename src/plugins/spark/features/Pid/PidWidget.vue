<script lang="ts">
import { uid } from 'quasar';
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import PidBasic from './PidBasic.vue';
import PidFull from './PidFull.vue';
import PidShareDialog from './PidShareDialog.vue';
import { startRelationsDialog } from './relations';
import { PidBlock } from './types';

@Component({
  components: {
    Basic: PidBasic,
    Full: PidFull,
    PidShareDialog,
  },
})
export default class PidWidget
  extends BlockWidgetBase<PidBlock> {

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

  showShareDialog(): void {
    createDialog({
      component: PidShareDialog,
      parent: this,
      graphId: uid(),
      graphCfg: this.graphCfg,
      block: this.block,
    });
  }
}
</script>

<template>
  <GraphCardWrapper :show="inDialog" v-bind="{context}">
    <template #graph>
      <HistoryGraph :graph-id="widget.id" :config="graphCfg" :refresh-trigger="mode" />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ActionItem icon="mdi-vector-line" label="Relations" @click="showRelations" />
          <!-- TODO(Elco): decide what values should appear in tuning view -->
          <!-- <ActionItem icon="mdi-cube-scan" label="Tuning view" @click="showShareDialog" /> -->
        </template>
      </component>
    </template>

    <component :is="mode" :crud="crud">
      <template #warnings>
        <CardWarning v-if="!outputId">
          <template #message>
            PID has no output block configured.
          </template>
        </CardWarning>
        <CardWarning v-if="!inputId">
          <template #message>
            PID has no input block configured.
          </template>
        </CardWarning>
        <CardWarning v-else-if="!block.data.enabled && mode !== 'Full'">
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
