<script lang="ts">
import { Component } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { bloxQty } from '@/helpers/bloxfield';
import { createBlockDialog, createDialog } from '@/helpers/dialog';
import { shortDateString, spliceById, typeMatchFilter } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { profileValues } from '@/plugins/spark/helpers';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { BlockType, PidBlock, Quantity, SetpointProfileBlock, SetpointSensorPairBlock } from '@/shared-types';

import { applyMode } from './helpers';
import TempControlModeDialog from './TempControlModeDialog.vue';
import { TempControlConfig, TempControlMode } from './types';

@Component({
  components: {
    TempControlModeDialog,
  },
})
export default class TempControlBasic
  extends CrudComponent<TempControlConfig> {
  setpointFilter = typeMatchFilter<SetpointSensorPairBlock>(BlockType.SetpointSensorPair);

  get serviceId(): string | null {
    return this.config.serviceId;
  }

  get module(): SparkServiceModule | null {
    return sparkStore.moduleById(this.serviceId);
  }

  get serviceTemp(): 'degC' | 'degF' {
    return this.module?.units.Temp ?? 'degC';
  }

  get tempMode(): TempControlMode | null {
    return this.config.modes.find(v => v.id === this.config.activeMode) ?? null;
  }

  get coolPid(): PidBlock | null {
    return this.module?.blockByLink(this.config.coolPid) ?? null;
  }

  get heatPid(): PidBlock | null {
    return this.module?.blockByLink(this.config.heatPid) ?? null;
  }

  get differentSetpoints(): boolean {
    return Boolean(this.module
      && this.coolPid && this.heatPid
      && this.coolPid.data.inputId.id !== this.heatPid.data.inputId.id);
  }

  get setpoint(): SetpointSensorPairBlock | null {
    return this.module && !this.differentSetpoints
      ? this.PidSetpoint(this.coolPid) ?? this.PidSetpoint(this.heatPid)
      : null;
  }

  get setpointSettingLabel(): string {
    return this.setpoint
      ? `${this.setpoint.id} setting`
      : 'Setpoint setting';
  }

  get setpointSetting(): Quantity {
    const value = this.profileEnabled
      ? this.setpoint?.data.setting
      : this.setpoint?.data.storedSetting;
    return value ?? bloxQty(null, this.serviceTemp);
  }

  set setpointSetting(value: Quantity) {
    if (this.module && this.setpoint) {
      this.setpoint.data.storedSetting = value;
      this.module.saveBlock(this.setpoint);
    }
  }

  get setpointEnabled(): boolean | null {
    return this.setpoint?.data.settingEnabled ?? null;
  }

  set setpointEnabled(value: boolean | null) {
    this.setControl(!!value);
  }

  get profile(): SetpointProfileBlock | null {
    return this.module?.blockByLink(this.config.profile) ?? null;
  }

  get profileEnabled(): boolean {
    return Boolean(this.setpointEnabled && this.profile?.data.enabled);
  }

  set profileEnabled(value: boolean) {
    if (!this.profile || !this.setpoint) {
      return;
    }

    if (!value) {
      this.profile.data.enabled = false;
      this.module?.saveBlock(this.profile);
      return;
    }

    const start = new Date((this.profile.data.start || 0) * 1000);
    createDialog({
      component: 'ConfirmDialog',
      title: 'Start profile',
      message: `
        Profile start time is ${shortDateString(start)}.
        Do you want to reset this value to current date and time?
        `,
      no: 'No',
      ok: 'Yes',
    })
      .onOk(async (reset: boolean) => {
        if (!this.profile || !this.setpoint) { return; }
        if (reset) {
          this.profile.data.start = new Date().getTime() / 1000;
        }
        this.profile.data.enabled = true;
        this.setpoint.data.settingEnabled = true;

        await this.module?.saveBlock(this.setpoint);
        await this.module?.saveBlock(this.profile);
      });
  }

  get profileValues() {
    return profileValues(this.profile);
  }

  PidSetpoint(pid: PidBlock | null): SetpointSensorPairBlock | null {
    return this.module?.blockByLink(pid?.data.inputId ?? null) ?? null;
  }

  showProfile(): void {
    createBlockDialog(this.profile);
  }

  async setControl(enabled: boolean): Promise<void> {
    if (this.profile && !enabled) {
      this.profile.data.enabled = false;
      await this.module?.saveBlock(this.profile);
    }

    if (this.setpoint) {
      this.setpoint.data.settingEnabled = enabled;
      await this.module?.saveBlock(this.setpoint);
    }
  }

  setControlMode(mode: TempControlMode | null) {

    if (!mode) {
      this.config.activeMode = null;
      this.saveConfig();
      return;
    }

    createDialog({
      component: TempControlModeDialog,
      value: mode,
      serviceId: this.serviceId,
      title: `Apply ${mode.title} mode`,
    })
      .onOk(async (mode: TempControlMode) => {
        try {
          this.config.modes = spliceById(this.config.modes, mode);
          this.config.activeMode = mode.id;
          await this.saveConfig();
          await applyMode(this.config, mode);
          notify.done(`Applied ${mode.title} mode`);
        }
        catch (e) {
          notify.error(e.message);
        }
      });
  }
}
</script>


<template>
  <div class="widget-body">
    <slot name="warnings" />

    <div class="row q-gutter-x-sm">
      <QuantityField
        v-if="setpoint"
        v-model="setpointSetting"
        :disable="profileEnabled"
        :label="setpoint.id"
        class="col-grow"
      />

      <LabeledField
        v-if="!setpoint"
        label="Setpoint setting"
        class="col-grow"
      >
        <b>{{
          differentSetpoints
            ? 'PID setpoints mismatched'
            : 'No setpoint set'
        }}</b>
      </LabeledField>

      <LabeledField
        v-if="profile"
        :readonly="false"
        label="Profile"
        class="col-grow"
        @click="showProfile"
      >
        <span v-if="profileValues">
          {{ profileValues.current | quantity }} to {{ profileValues.next | quantity }}
        </span>
        <span v-else>
          ---
        </span>
      </LabeledField>

      <LabeledField
        v-if="!profile"
        label="Profile"
        class="col-grow"
      >
        Not set
      </LabeledField>
    </div>

    <q-item tag="label" class="col-grow">
      <q-item-section>
        <q-item-label>Enable control</q-item-label>
      </q-item-section>
      <q-item-section avatar>
        <q-toggle
          v-model="setpointEnabled"
        />
      </q-item-section>
    </q-item>

    <q-item tag="label" class="col-grow">
      <q-item-section>
        <q-item-label>Temperature profile</q-item-label>
      </q-item-section>
      <q-item-section avatar>
        <q-toggle
          v-model="profileEnabled"
        />
      </q-item-section>
    </q-item>

    <q-item class="col-grow">
      <q-item-section>
        <q-item-label>Control mode</q-item-label>
      </q-item-section>
      <q-item-section avatar>
        <div class="q-gutter-x-xs">
          <q-btn
            label="None"
            unelevated
            :color="tempMode == null ? 'primary' : ''"
            @click="setControlMode(null)"
          />
          <q-btn
            v-for="mode in config.modes"
            :key="'mode-opt-'+mode.id"
            :label="mode.title"
            unelevated
            :color="tempMode && mode.id === tempMode.id ? 'primary' : ''"
            @click="setControlMode(mode)"
          />
        </div>
      </q-item-section>
    </q-item>
  </div>
</template>
