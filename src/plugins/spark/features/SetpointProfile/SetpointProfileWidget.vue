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

  get graphProps(): GraphProps {
    return profileGraphProps(this.block);
  }

  refresh(): void {
    this.revision++;
  }

  mounted(): void {
    this.$watch('block.data.targetId.id', this.refresh);
    this.$watch('block.data.enabled', this.refresh);
  }
}
</script>

<template>
  <GraphCardWrapper
    show-initial
    :show="inDialog && mode ==='Full'"
    :no-scroll="mode === 'Basic'"
    v-bind="{context}"
  >
    <template #graph>
      <GenericGraph v-bind="graphProps" :revision="revision" />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ProfilePresetAction :crud="crud" />
        </template>
      </component>
    </template>

    <component :is="mode" :crud="crud">
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
        <q-resize-observer @resize="refresh" />
        <GenericGraph v-bind="graphProps" :revision="revision" auto-fit auto-resize />
      </template>
    </component>
  </GraphCardWrapper>
</template>
