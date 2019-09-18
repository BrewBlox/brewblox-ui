<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { GraphProps, profileGraphProps } from './helpers';
import ProfilePresetAction from './ProfilePresetAction.vue';
import { SetpointProfileBlock } from './types';

@Component({
  components: {
    ProfilePresetAction,
  },
})
export default class SetpointProfileWidget extends BlockWidget {
  readonly block!: SetpointProfileBlock;
  revision = 0;

  get startTime(): number {
    return this.block.data.start * 1000;
  }

  get graphProps(): GraphProps {
    return profileGraphProps(this.block);
  }

  mounted(): void {
    this.$watch('widget.cols', () => this.revision++);
    this.$watch('widget.rows', () => this.revision++);
  }
}
</script>

<template>
  <q-card dark class="text-white column">
    <BlockWidgetToolbar :crud="crud">
      <template v-slot:actions>
        <ProfilePresetAction :crud="crud" />
      </template>
    </BlockWidgetToolbar>
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
    <div class="col">
      <Graph :data="graphProps.data" :layout="graphProps.layout" :revision="revision" />
    </div>
  </q-card>
</template>
