<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useWidget } from '@/composables';
import { sparkStore } from '@/plugins/spark/store';
import {
  BlockType,
  PidBlock,
  SetpointProfileBlock,
} from '@/shared-types';
import { createDialog } from '@/utils/dialog';
import { spliceById, typeMatchFilter } from '@/utils/functional';

import TempControlModeDialog from './TempControlModeDialog.vue';
import TempControlPidView from './TempControlPidView.vue';
import { TempControlMode, TempControlWidget } from './types';

const pidFilter = typeMatchFilter<PidBlock>(BlockType.Pid);
const profileFilter = typeMatchFilter<SetpointProfileBlock>(BlockType.SetpointProfile);

export default defineComponent({
  name: 'TempControlFull',
  components: {
    TempControlPidView,
  },
  setup() {
    const {
      config,
      saveConfig,
    } = useWidget.setup<TempControlWidget>();

    const serviceOpts = computed<string[]>(
      () => sparkStore.serviceIds,
    );

    const serviceId = computed<string | null>(
      () => config.value.serviceId,
    );

    function showMode(mode: TempControlMode): void {
      createDialog({
        component: TempControlModeDialog,
        componentProps: {
          modelValue: mode,
          title: `Edit ${mode.title} mode`,
          serviceId: serviceId.value,
          saveMode: (mode: TempControlMode) => {
            config.value.modes = spliceById(config.value.modes, mode);
            saveConfig();
          },
        },
      });
    }

    return {
      serviceId,
      serviceOpts,
      config,
      saveConfig,
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
      @update:model-value="v => { config.serviceId = v; saveConfig(); }"
    />
    <LinkField
      :model-value="config.coolPid"
      :service-id="serviceId"
      :block-filter="pidFilter"
      title="Cool PID"
      label="Cool PID"
      class="col-grow"
      @update:model-value="v => { config.coolPid = v; saveConfig(); }"
    />
    <LinkField
      :model-value="config.heatPid"
      :service-id="serviceId"
      :block-filter="pidFilter"
      title="Heat PID"
      label="Heat PID"
      class="col-grow"
      @update:model-value="v => { config.heatPid = v; saveConfig(); }"
    />
    <LinkField
      :model-value="config.profile"
      :service-id="serviceId"
      :block-filter="profileFilter"
      title="Setpoint Profile"
      label="Setpoint Profile"
      class="col-grow"
      @update:model-value="v => { config.profile = v; saveConfig(); }"
    />
    <LabeledField
      v-for="mode in config.modes"
      :key="'config-'+mode.id"
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
