<script lang="ts">
import { computed, defineComponent } from 'vue';

import CrudComponent from '@/components/CrudComponent';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import {
  BlockType,
  Link,
  PidBlock,
  Quantity,
  SetpointProfileBlock,
  SetpointSensorPairBlock,
} from '@/shared-types';
import { tempQty } from '@/utils/bloxfield';
import { createDialog } from '@/utils/dialog';
import { spliceById, typeMatchFilter } from '@/utils/functional';

import TempControlModeDialog from './TempControlModeDialog.vue';
import TempControlPidView from './TempControlPidView.vue';
import { TempControlConfig, TempControlMode } from './types';

@Component({
  components: {
    TempControlPidView,
    TempControlModeDialog,
  },
})
export default class TempControlFull extends CrudComponent<TempControlConfig> {
  pidFilter = typeMatchFilter<PidBlock>(BlockType.Pid);
  profileFilter = typeMatchFilter<SetpointProfileBlock>(BlockType.SetpointProfile);
  setpointFilter = typeMatchFilter<SetpointSensorPairBlock>(BlockType.SetpointSensorPair);

  get serviceOpts(): string[] {
    return sparkStore.serviceIds;
  }

  get serviceId(): string | null {
    return this.config.serviceId;
  }

  get module(): SparkServiceModule | null {
    return sparkStore.moduleById(this.serviceId);
  }

  get profile(): SetpointProfileBlock | null {
    return this.module?.blockByLink(this.config.profile) ?? null;
  }

  get controlMode(): string | null {
    return this.config.activeMode;
  }

  set controlMode(v: string | null) {
    this.config.activeMode = v;
    this.saveConfig();
  }

  get modeOpts(): SelectOption[] {
    return this.config.modes.map(m => ({ label: m.title, value: m.id }));
  }

  setpointValue(link: Link): Quantity {
    const block = this.module?.blockByLink(link);
    return this.setpointFilter(block)
      ? block.data.storedSetting
      : tempQty(null);
  }

  saveMode(mode: TempControlMode): void {
    this.config.modes = spliceById(this.config.modes, mode);
    this.saveConfig();
  }

  showMode(mode: TempControlMode): void {
    createDialog({
      component: TempControlModeDialog,
      title: `Edit ${mode.title} mode`,
      serviceId: this.serviceId,
      value: mode,
      saveMode: (mode: TempControlMode) => {
        this.config.modes = spliceById(this.config.modes, mode);
        this.saveConfig();
      },
    });
  }
}
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
