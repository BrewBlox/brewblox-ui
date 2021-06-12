<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

import { useContext, useWidget } from '@/composables';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { ProfileValues } from '@/plugins/spark/types';
import { calculateProfileValues } from '@/plugins/spark/utils';
import { PidBlock, Quantity, SetpointProfileBlock, SetpointSensorPairBlock } from '@/shared-types';
import { concatById } from '@/utils/collections';
import { createBlockDialog, createDialog } from '@/utils/dialog';
import { prettyQty, shortDateString } from '@/utils/formatting';
import { notify } from '@/utils/notify';
import { bloxQty, tempQty } from '@/utils/quantity';

import { PidConfig } from '../types';
import TempControlModeDialog from './TempControlModeDialog.vue';
import TempControlSyncView from './TempControlSyncView.vue';
import { TempControlMode, TempControlWidget } from './types';
import { applyMode, findControlProblems, TempControlProblem } from './utils';

export default defineComponent({
  name: 'TempControlBasic',
  components: {
    TempControlSyncView,
  },
  setup() {
    const {
      context,
    } = useContext.setup();
    const {
      config,
      saveConfig,
    } = useWidget.setup<TempControlWidget>();

    const problems = ref<TempControlProblem[]>([]);
    const detected = ref<Date | null>(null);

    const serviceId = computed<string | null>(
      () => config.value.serviceId,
    );

    const module = computed<SparkServiceModule | null>(
      () => sparkStore.moduleById(serviceId.value),
    );

    const tempMode = computed<TempControlMode | null>(
      () => config.value.modes.find(v => v.id === config.value.activeMode) ?? null,
    );

    const coolPid = computed<PidBlock | null>(
      () => module.value?.blockByLink(config.value.coolPid) ?? null,
    );

    const heatPid = computed<PidBlock | null>(
      () => module.value?.blockByLink(config.value.heatPid) ?? null,
    );

    const differentSetpoints = computed<boolean>(
      () => Boolean(module.value
        && coolPid.value && heatPid.value
        && coolPid.value.data.inputId.id !== heatPid.value.data.inputId.id),
    );

    const setpoint = computed<SetpointSensorPairBlock | null>(
      () => module.value && !differentSetpoints.value
        ? pidSetpoint(coolPid.value) ?? pidSetpoint(heatPid.value)
        : null,
    );

    const setpointSetting = computed<Quantity>({
      get: () => {
        const value = profileEnabled.value
          ? setpoint.value?.data.setting
          : setpoint.value?.data.storedSetting;
        return value ?? tempQty(null);
      },
      set: value => {
        if (module.value && setpoint.value) {
          setpoint.value.data.storedSetting = value;
          module.value.saveBlock(setpoint.value);
        }
      },
    });

    const setpointEnabled = computed<boolean | null>({
      get: () => setpoint.value?.data.settingEnabled ?? null,
      set: value => setControl(!!value),
    });

    const profile = computed<SetpointProfileBlock | null>(
      () => module.value?.blockByLink(config.value.profile) ?? null,
    );

    const profileEnabled = computed<boolean>({
      get: () => Boolean(setpointEnabled.value && profile.value?.data.enabled),
      set: value => {
        if (!profile.value || !setpoint.value) {
          return;
        }

        if (!value) {
          profile.value.data.enabled = false;
          module.value?.saveBlock(profile.value);
          return;
        }

        const start = new Date((profile.value.data.start || 0) * 1000);
        createDialog({
          component: 'ConfirmDialog',
          componentProps: {
            title: 'Start profile',
            message: `
          Profile start time is ${start.toLocaleString()}.
          Do you want to reset this value to current date and time?
          `,
            nok: 'No',
            ok: 'Yes',
          },
        })
          .onOk(async (reset: boolean) => {
            if (!profile.value || !setpoint.value) { return; }
            if (reset) {
              profile.value.data.start = new Date().getTime() / 1000;
            }
            profile.value.data.enabled = true;
            setpoint.value.data.settingEnabled = true;

            await module.value?.saveBlock(setpoint.value);
            await module.value?.saveBlock(profile.value);
          });
      },
    });

    const profileValues = computed<ProfileValues | null>(
      () => calculateProfileValues(profile.value),
    );

    function checkMismatch(pid: PidBlock | null, config: PidConfig | null | undefined): boolean {
      return pid && config
        ? ['kp', 'ti', 'td'].some(k => !bloxQty(pid.data[k]).eq(config[k]))
        : false;
    }

    const coolConfigMismatch = computed<boolean>(
      () => checkMismatch(coolPid.value, tempMode.value?.coolConfig),
    );

    const heatConfigMismatch = computed<boolean>(
      () => checkMismatch(heatPid.value, tempMode.value?.heatConfig),
    );


    function applySync(kind: 'cool' | 'heat', leading: 'pid' | 'mode'): void {
      const pid = kind === 'cool'
        ? coolPid.value
        : heatPid.value;

      if (!module.value || !tempMode.value || !pid) {
        return;
      }

      if (leading === 'pid') {
        const { kp, td, ti } = pid.data;
        tempMode.value[`${kind}Config`] = { kp, td, ti };
        config.value.modes = concatById(config.value.modes, tempMode.value);
        saveConfig();
      }

      if (leading === 'mode') {
        const config: PidConfig = tempMode.value[`${kind}Config`];
        if (config) {
          pid.data = { ...pid.data, ...config };
          module.value.saveBlock(pid);
        }
      }
    }

    function pidSetpoint(pid: PidBlock | null): SetpointSensorPairBlock | null {
      return module.value?.blockByLink(pid?.data.inputId ?? null) ?? null;
    }

    function showProfile(): void {
      createBlockDialog(profile.value);
    }

    async function setControl(enabled: boolean): Promise<void> {
      if (profile.value && !enabled) {
        profile.value.data.enabled = false;
        await module.value?.saveBlock(profile.value);
      }

      if (setpoint.value) {
        setpoint.value.data.settingEnabled = enabled;
        await module.value?.saveBlock(setpoint.value);
      }
    }

    async function setControlMode(id: string): Promise<void> {
      const mode = config.value.modes.find(v => v.id === id);

      if (!mode) {
        config.value.activeMode = null;
        saveConfig();
        return;
      }

      createDialog({
        component: TempControlModeDialog,
        componentProps: {
          modelValue: mode,
          serviceId: serviceId.value,
          title: `Apply ${mode.title} mode`,
          showConfirm: true,
          saveMode: (mode: TempControlMode) => {
            config.value.modes = concatById(config.value.modes, mode);
            saveConfig();
          },
        },
      })
        .onOk(async () => {
          try {
            await applyMode(config.value, mode);
            config.value.activeMode = mode.id;
            notify.done(`Applied ${mode.title} mode`);
          }
          catch (e) {
            config.value.activeMode = null;
            notify.error(e.message);
          }
          finally {
            await saveConfig();
          }
        });
    }

    function selectControlMode(): void {
      createDialog({
        component: 'SelectDialog',
        componentProps: {
          modelValue: config.value.activeMode ?? '',
          title: 'Select control mode',
          message: 'Pick a control mode. You can edit its settings before it is applied.',
          listSelect: true,
          selectOptions: [
            { value: '', label: 'Manual' },
            ...config.value.modes.map(v => ({ value: v.id, label: v.title })),
          ],
        },
      })
        .onOk(setControlMode);
    }

    function troubleshoot(): void {
      problems.value = findControlProblems(config.value, {
        showConfig: () => context.mode = 'Full',
      });
      detected.value = new Date();
    }

    async function autofix(problem: TempControlProblem): Promise<void> {
      if (problem.autofix) {
        await problem.autofix(config.value);
        troubleshoot();
      }
    }

    return {
      prettyQty,
      shortDateString,
      setpoint,
      setpointSetting,
      profileEnabled,
      differentSetpoints,
      profile,
      showProfile,
      profileValues,
      selectControlMode,
      tempMode,
      setpointEnabled,
      troubleshoot,
      detected,
      problems,
      autofix,
      coolPid,
      coolConfigMismatch,
      applySync,
      heatPid,
      heatConfigMismatch,
    };
  },
});
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
          {{ prettyQty(profileValues.prev) }} to {{ prettyQty(profileValues.next) }}
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
      <q-item-section avatar class="q-pr-sm text-big">
        <span v-if="tempMode" class="text-primary ">
          {{ tempMode.title }}
        </span>
        <span v-else>
          Manual
        </span>
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
        Last checked: {{ shortDateString(detected) }}
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
      v-if="coolPid && tempMode && coolConfigMismatch"
      :block-config="coolPid.data"
      :mode-config="tempMode.coolConfig"
      @apply="v => applySync('cool', v)"
    >
      <template #message>
        Settings in cool PID do not match settings stored in {{ tempMode.title }} mode.
      </template>
    </TempControlSyncView>

    <TempControlSyncView
      v-if="heatPid && tempMode && heatConfigMismatch"
      :block-config="heatPid.data"
      :mode-config="tempMode.heatConfig"
      @apply="v => applySync('heat', v)"
    >
      <template #message>
        Settings in heat PID do not match settings stored in {{ tempMode.title }} mode.
      </template>
    </TempControlSyncView>
  </div>
</template>
