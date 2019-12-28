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
export default class SetpointProfileWidget
  extends BlockWidgetBase<SetpointProfileBlock> {
  revision = 0;

  // Overrides WidgetBase
  *cardClassGenerator(): Generator<string, void, undefined> {
    yield 'bg-dark';

    yield this.inDialog
      ? 'widget-modal'
      : 'widget-dashboard';

    if (this.$q.screen.lt.lg) {
      yield 'widget-dense';
    }

    if (this.mode === 'Basic') {
      yield* ['col', 'column'];
    }

    if (this.mode === 'Full' && !this.inDialog) {
      yield* ['overflow-auto', 'scroll'];
    }
  }

  get cardStyle(): Mapped<string> {
    return {};
    // return this.inDialog && this.mode === 'Basic'
    //   ? { height: '60vh' }
    //   : {};
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
          <template #actions>
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
