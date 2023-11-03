<script setup lang="ts">
import TempControlModeDialog from './TempControlModeDialog.vue';
import TempControlPidView from './TempControlPidView.vue';
import { TempControlMode, TempControlWidget } from './types';
import { useWidget } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { concatById } from '@/utils/collections';
import { createComponentDialog } from '@/utils/dialog';
import { makeTypeFilter } from '@/utils/functional';
import { BlockType, PidBlock, SetpointProfileBlock } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

const pidFilter = makeTypeFilter<PidBlock>(BlockType.Pid);
const profileFilter = makeTypeFilter<SetpointProfileBlock>(
  BlockType.SetpointProfile,
);

export default defineComponent({
  name: 'TempControlFull',
  components: {
    TempControlPidView,
  },
  setup() {
    const { config, patchConfig } = useWidget.setup<TempControlWidget>();
    const sparkStore = useSparkStore();

    const serviceOpts = computed<string[]>(() => sparkStore.serviceIds);

    const serviceId = computed<string | null>(() => config.value.serviceId);

    function showMode(mode: TempControlMode): void {
      if (!serviceId.value) {
        return;
      }
      createComponentDialog({
        component: TempControlModeDialog,
        componentProps: {
          modelValue: mode,
          title: `Edit ${mode.title} mode`,
          serviceId: serviceId.value,
          saveMode: (mode: TempControlMode) => {
            patchConfig({ modes: concatById(config.value.modes, mode) });
          },
        },
      });
    }

    return {
      serviceId,
      serviceOpts,
      config,
      patchConfig,
      pidFilter,
      profileFilter,
      showMode,
    };
  },
});
</script>

<template>
  <div class="widget-body">
    <slot name="warnings" />
    <SelectField
      :model-value="serviceId"
      :options="serviceOpts"
      label="Service"
      title="Service"
      message="Which Spark controls your fermentation?"
      list-select
      clearable
      @update:model-value="(v) => patchConfig({ serviceId: v })"
    />
    <LinkField
      v-if="serviceId"
      :model-value="config.coolPid"
      :service-id="serviceId"
      :block-filter="pidFilter"
      title="Cool PID"
      label="Cool PID"
      class="col-grow"
      @update:model-value="(v) => patchConfig({ coolPid: v })"
    />
    <LinkField
      v-if="serviceId"
      :model-value="config.heatPid"
      :service-id="serviceId"
      :block-filter="pidFilter"
      title="Heat PID"
      label="Heat PID"
      class="col-grow"
      @update:model-value="(v) => patchConfig({ heatPid: v })"
    />
    <LinkField
      v-if="serviceId"
      :model-value="config.profile"
      :service-id="serviceId"
      :block-filter="profileFilter"
      title="Setpoint Profile"
      label="Setpoint Profile"
      class="col-grow"
      @update:model-value="(v) => patchConfig({ profile: v })"
    />
    <LabeledField
      v-for="mode in config.modes"
      :key="'config-' + mode.id"
      class="clickable"
      @click="showMode(mode)"
    >
      <template #label>
        <b>{{ mode.title }} mode</b>
      </template>
      <div class="row q-mt-xs">
        <TempControlPidView
          v-if="mode.coolConfig"
          :model-value="mode.coolConfig"
          class="column q-mr-lg"
        />
        <TempControlPidView
          v-if="mode.heatConfig"
          :model-value="mode.heatConfig"
          class="column"
        />
      </div>
    </LabeledField>
  </div>
</template>
