<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';

import { deepCopy, isJsonEqual } from '@/helpers/functional';
import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { Link, SetpointProfileBlock } from '@/plugins/spark/types';

import { GraphProps, profileGraphProps } from './helpers';
import ProfileExportAction from './ProfileExportAction.vue';
import ProfileImportAction from './ProfileImportAction.vue';
import ProfilePresetAction from './ProfilePresetAction.vue';
import SetpointProfileBasic from './SetpointProfileBasic.vue';
import SetpointProfileFull from './SetpointProfileFull.vue';

type SetpointProfileData = SetpointProfileBlock['data'];

@Component({
  components: {
    Basic: SetpointProfileBasic,
    Full: SetpointProfileFull,
    ProfileImportAction,
    ProfilePresetAction,
    ProfileExportAction,
  },
})
export default class SetpointProfileWidget
  extends BlockWidgetBase<SetpointProfileBlock> {
  usedData: SetpointProfileData | null = null;
  revision = 0;

  @Watch('block.data')
  watchData(newV: SetpointProfileData): void {
    if (!isJsonEqual(newV, this.usedData)) {
      this.refresh();
    }
  }

  created(): void {
    this.usedData = deepCopy(this.block.data);
  }

  get target(): Link {
    return this.block.data.targetId;
  }

  get graphProps(): GraphProps {
    return profileGraphProps(this.block);
  }

  refresh(): void {
    this.usedData = deepCopy(this.block.data);
    this.revision++;
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
          <ProfileExportAction :crud="crud" />
          <ProfileImportAction :crud="crud" />
        </template>
      </component>
    </template>

    <component :is="mode" :crud="crud">
      <template #warnings>
        <CardWarning v-if="!target.id">
          <template #message>
            Setpoint Profile has no target Setpoint configured.
          </template>
        </CardWarning>
        <BlockEnableToggle
          v-else
          :hide-enabled="mode === 'Basic'"
          :crud="crud"
        >
          <template #enabled>
            Setpoint Profile is enabled and driving <i>{{ target | link }}</i>.
          </template>
          <template #disabled>
            Setpoint Profile is disabled and not driving <i>{{ target | link }}</i>.
          </template>
        </BlockEnableToggle>
      </template>

      <template #graph>
        <q-resize-observer @resize="refresh" />
        <GenericGraph v-bind="graphProps" :revision="revision" auto-fit auto-resize />
      </template>
    </component>
  </GraphCardWrapper>
</template>
