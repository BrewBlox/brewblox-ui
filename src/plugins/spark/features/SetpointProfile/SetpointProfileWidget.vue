<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { GraphProps, profileGraphProps } from './helpers';
import SetpointProfileBasic from './SetpointProfileBasic.vue';
import SetpointProfileFull from './SetpointProfileFull.vue';
import { SetpointProfileBlock } from './types';

@Component({
  components: {
    Basic: SetpointProfileBasic,
    Full: SetpointProfileFull,
  },
})
export default class SetpointProfileWidget extends BlockWidgetBase {
  readonly block!: SetpointProfileBlock;
  revision = 0;

  get cardClass(): string[] {
    if (this.inDialog) {
      return this.mode === 'Full'
        ? ['widget-modal']
        : ['widget-modal', 'col', 'column'];
    }
    else {
      return this.mode === 'Full'
        ? ['widget-dashboard', 'overflow-auto', 'scroll']
        : ['widget-dashboard', 'overflow-unset', 'col', 'column'];
    }
  }

  get cardStyle(): Mapped<string> {
    return this.inDialog && this.mode === 'Basic'
      ? { height: '60vh' }
      : {};
  }

  get graphProps(): GraphProps {
    return profileGraphProps(this.block);
  }

  mounted(): void {
    const updateGraph = (): any => this.revision++;
    this.$watch('block.data.targetId.id', updateGraph);
    this.$watch('block.data.enabled', updateGraph);
    this.$watch('widget.cols', updateGraph);
    this.$watch('widget.rows', updateGraph);
  }
}
</script>

<template>
  <GraphCardWrapper :show="inDialog && mode ==='Full'">
    <template #graph>
      <GenericGraph v-bind="graphProps" :revision="revision" />
    </template>

    <component :is="mode" :crud="crud" :class="cardClass" :style="cardStyle">
      <template #toolbar>
        <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
          <template v-slot:actions>
            <ProfilePresetAction :crud="crud" />
          </template>
        </component>
      </template>

      <template #warnings>
        <CardWarning v-if="!block.data.targetId.id">
          <template #message>
            Setpoint Profile has no target Setpoint configured.
          </template>
        </CardWarning>
        <CardWarning v-else-if="!block.data.enabled">
          <template #message>
            <span>
              Setpoint Profile is disabled:
              <i>{{ block.data.targetId }}</i> will not be changed.
            </span>
          </template>
          <template #actions>
            <q-btn
              text-color="white"
              flat
              label="Enable"
              @click="block.data.enabled = true; saveBlock()"
            />
          </template>
        </CardWarning>
      </template>

      <template #graph>
        <GenericGraph v-bind="graphProps" :revision="revision" auto-fit auto-resize />
      </template>
    </component>
  </GraphCardWrapper>
</template>
