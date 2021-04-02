<script lang="ts">
import { Component } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { tempQty } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';
import { spliceById, typeMatchFilter } from '@/helpers/functional';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import {
  BlockType,
  Link,
  PidBlock,
  Quantity,
  SetpointProfileBlock,
  SetpointSensorPairBlock,
} from '@/shared-types';

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
      :value="serviceId"
      :options="serviceOpts"
      label="Service"
      title="Service"
      message="Which Spark controls your fermentation?"
      list-select
      clearable
      @input="v => { config.serviceId = v; saveConfig(); }"
    />
    <LinkField
      :value="config.coolPid"
      :service-id="serviceId"
      :block-filter="pidFilter"
      title="Cool PID"
      label="Cool PID"
      class="col-grow"
      @input="v => { config.coolPid = v; saveConfig(); }"
    />
    <LinkField
      :value="config.heatPid"
      :service-id="serviceId"
      :block-filter="pidFilter"
      title="Heat PID"
      label="Heat PID"
      class="col-grow"
      @input="v => { config.heatPid = v; saveConfig(); }"
    />
    <LinkField
      :value="config.profile"
      :service-id="serviceId"
      :block-filter="profileFilter"
      title="Setpoint Profile"
      label="Setpoint Profile"
      class="col-grow"
      @input="v => { config.profile = v; saveConfig(); }"
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
          :value="mode.coolConfig"
          class="column q-mr-lg"
        />
        <TempControlPidView
          v-if="mode.heatConfig"
          :value="mode.heatConfig"
          class="column"
        />
      </div>
    </LabeledField>
  </div>
</template>
