<script lang="ts">
import { Component } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { createDialog } from '@/helpers/dialog';
import { deepCopy, spliceById, typeMatchFilter } from '@/helpers/functional';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { BlockType, SetpointProfileBlock } from '@/shared-types';

import TempControlModeDialog from './TempControlModeDialog.vue';
import { TempControlConfig, TempControlMode } from './types';

@Component({
  components: {
    TempControlModeDialog,
  },
})
export default class TempControlFull
  extends CrudComponent<TempControlConfig> {
  pidFilter = typeMatchFilter(BlockType.Pid);
  profileFilter = typeMatchFilter(BlockType.SetpointProfile);

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

  saveMode(mode: TempControlMode): void {
    this.config.modes = spliceById(this.config.modes, mode);
    this.saveConfig();
  }

  showMode(mode: TempControlMode): void {
    createDialog({
      component: TempControlModeDialog,
      value: deepCopy(mode),
      serviceId: this.serviceId,
      title: `Edit ${mode.title} mode`,
    })
      .onOk((mode: TempControlMode) => {
        this.config.modes = spliceById(this.config.modes, mode);
        this.saveConfig();
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
      :label="mode.title"
      class="clickable"
      @click="showMode(mode)"
    >
      <div class="text-red q-gutter-x-sm col-grow row justify-between">
        <span>Kp={{ mode.heatConfig.kp | quantity }}</span>
        <span>Td={{ mode.heatConfig.td | duration }}</span>
        <span>Ti={{ mode.heatConfig.ti | duration }}</span>
      </div>
      <div class="text-blue q-gutter-x-sm col-grow row justify-between">
        <span>Kp={{ mode.coolConfig.kp | quantity }}</span>
        <span>Td={{ mode.coolConfig.td | duration }}</span>
        <span>Ti={{ mode.coolConfig.ti | duration }}</span>
      </div>
    </LabeledField>

    <div class="row justify-end">
      <q-btn flat color="secondary" label="New mode" />
    </div>
  </div>
</template>
