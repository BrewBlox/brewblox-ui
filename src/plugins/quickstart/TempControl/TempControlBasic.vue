<script lang="ts">
import { computed, defineComponent } from 'vue';

import CrudComponent from '@/components/CrudComponent';
import { bloxQty, tempQty } from '@/utils/bloxfield';
import { createBlockDialog, createDialog } from '@/utils/dialog';
import { spliceById, typeMatchFilter } from '@/utils/functional';
import notify from '@/utils/notify';
import { profileValues } from '@/plugins/spark/utils';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { BlockType, PidBlock, Quantity, SetpointProfileBlock, SetpointSensorPairBlock } from '@/shared-types';

import { PidConfig } from '../types';
import { applyMode, findControlProblems, TempControlProblem } from './helpers';
import TempControlModeDialog from './TempControlModeDialog.vue';
import TempControlPidView from './TempControlPidView.vue';
import TempControlSyncView from './TempControlSyncView.vue';
import { TempControlConfig, TempControlMode } from './types';

@Component({
  components: {
    TempControlModeDialog,
    TempControlPidView,
    TempControlSyncView,
  },
})
export default class TempControlBasic extends CrudComponent<TempControlConfig> {
  setpointFilter = typeMatchFilter<SetpointSensorPairBlock>(BlockType.SetpointSensorPair);
  problems: TempControlProblem[] = [];
  detected: Date | null = null;

  get serviceId(): string | null {
    return this.config.serviceId;
  }

  get module(): SparkServiceModule | null {
    return sparkStore.moduleById(this.serviceId);
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
    return value ?? tempQty(null);
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
        Profile start time is ${start.toLocaleString()}.
        Do you want to reset this value to current date and time?
        `,
      nok: 'No',
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

  checkMismatch(pid: PidBlock | null, config: PidConfig | null | undefined): boolean {
    return pid && config
      ? ['kp', 'ti', 'td'].some(k => !bloxQty(pid.data[k]).eq(config[k]))
      : false;
  }

  get coolConfigMismatch(): boolean {
    return this.checkMismatch(this.coolPid, this.tempMode?.coolConfig);
  }

  get heatConfigMismatch(): boolean {
    return this.checkMismatch(this.heatPid, this.tempMode?.heatConfig);
  }

  applySync(kind: 'cool' | 'heat', leading: 'pid' | 'mode'): void {
    const pid = kind === 'cool'
      ? this.coolPid
      : this.heatPid;

    if (!this.module || !this.tempMode || !pid) {
      return;
    }

    if (leading === 'pid') {
      const { kp, td, ti } = pid.data;
      this.tempMode[`${kind}Config`] = { kp, td, ti };
      this.config.modes = spliceById(this.config.modes, this.tempMode);
      this.saveConfig();
    }

    if (leading === 'mode') {
      const config: PidConfig = this.tempMode[`${kind}Config`];
      if (config) {
        pid.data = { ...pid.data, ...config };
        this.module.saveBlock(pid);
      }
    }
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

  async setControlMode(id: string) {
    const mode = this.config.modes.find(v => v.id === id);

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
      showConfirm: true,
      saveMode: (mode: TempControlMode) => {
        this.config.modes = spliceById(this.config.modes, mode);
        this.saveConfig();
      },
    })
      .onOk(async () => {
        try {
          await applyMode(this.config, mode);
          this.config.activeMode = mode.id;
          notify.done(`Applied ${mode.title} mode`);
        }
        catch (e) {
          this.config.activeMode = null;
          notify.error(e.message);
        }
        finally {
          await this.saveConfig();
        }
      });
  }

  selectControlMode(): void {
    createDialog({
      component: 'SelectDialog',
      title: 'Select control mode',
      message: 'Pick a control mode. You can edit its settings before it is applied.',
      value: this.config.activeMode ?? '',
      listSelect: true,
      selectOptions: [
        { value: '', label: 'Manual' },
        ...this.config.modes.map(v => ({ value: v.id, label: v.title })),
      ],
    })
      .onOk(this.setControlMode);
  }

  troubleshoot(): void {
    this.problems = findControlProblems(this.config, { showConfig: () => this.$emit('full') });
    this.detected = new Date();
  }

  async autofix(problem: TempControlProblem): Promise<void> {
    if (problem.autofix) {
      await problem.autofix(this.config);
      this.troubleshoot();
    }
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
        :readonly="profileEnabled"
        :label="setpoint.id"
        class="col-grow"
        tag="big"
        tag-class="text-secondary"
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
        :label="profile.id"
        class="col-grow"
        @click="showProfile"
      >
        <span v-if="profileValues">
          {{ profileValues.prev | quantity }} to {{ profileValues.next | quantity }}
        </span>
        <span v-else>
          ---
        </span>
      </LabeledField>

      <LabeledField
        v-if="!profile"
        label="Setpoint Profile"
        class="col-grow"
      >
        Not set
      </LabeledField>
    </div>

    <q-item tag="label" @click="selectControlMode">
      <q-item-section>
        <q-item-label>Control mode</q-item-label>
      </q-item-section>
      <q-item-section avatar class="q-pr-sm">
        <big v-if="tempMode" class="text-primary ">
          {{ tempMode.title }}
        </big>
        <big v-else>
          Manual
        </big>
      </q-item-section>
    </q-item>

    <q-item tag="label">
      <q-item-section>
        <q-item-label>Setpoint enabled</q-item-label>
      </q-item-section>
      <q-item-section avatar>
        <q-toggle
          v-model="setpointEnabled"
        />
      </q-item-section>
    </q-item>

    <q-item
      tag="label"
      :disable="!profile"
    >
      <q-item-section>
        <q-item-label>Setpoint driven by Profile</q-item-label>
      </q-item-section>
      <q-item-section avatar>
        <q-toggle
          v-model="profileEnabled"
          :disable="!profile"
        />
      </q-item-section>
    </q-item>

    <q-item tag="label" class="col-grow" @click="troubleshoot">
      <q-item-section>
        <q-item-label>Check for problems</q-item-label>
      </q-item-section>
      <q-item-section v-if="detected" class="fade-4 col-auto">
        Last checked: {{ detected | shortDateString }}
      </q-item-section>
      <q-item-section avatar>
        <q-icon name="mdi-refresh" class="q-pr-md" />
      </q-item-section>
    </q-item>

    <div v-if="detected" class="column q-gutter-y-sm q-px-sm">
      <LabeledField
        v-for="(problem, idx) in problems"
        :key="`problem-${detected}-${idx}`"
        :label="problem.autofix ? 'Click to fix' : 'Please fix manually'"
        :readonly="!problem.autofix"
        :class="[
          'row items-center',
          !problem.autofix && 'cursor-not-allowed dashed'
        ]"
        tag-class="row"
        @click="autofix(problem)"
      >
        <template #before>
          <q-icon name="warning" color="warning" size="lg" />
        </template>
        <div
          v-html="problem.desc"
        />
      </LabeledField>
    </div>

    <TempControlSyncView
      v-if="coolConfigMismatch"
      :block-config="coolPid.data"
      :mode-config="tempMode.coolConfig"
      @apply="v => applySync('cool', v)"
    >
      <template #message>
        Settings in cool PID do not match settings stored in {{ modeTitle }} mode.
      </template>
    </TempControlSyncView>

    <TempControlSyncView
      v-if="heatConfigMismatch"
      :block-config="heatPid.data"
      :mode-config="tempMode.heatConfig"
      @apply="v => applySync('heat', v)"
    >
      <template #message>
        Settings in heat PID do not match settings stored in {{ modeTitle }} mode.
      </template>
    </TempControlSyncView>
  </div>
</template>
