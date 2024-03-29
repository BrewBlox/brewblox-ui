<script setup lang="ts">
import {
  PidBlock,
  Quantity,
  SetpointProfileBlock,
  SetpointSensorPairBlock,
} from 'brewblox-proto/ts';
import { computed, ref } from 'vue';
import { useContext, useWidget } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { ProfileValues } from '@/plugins/spark/types';
import { calculateProfileValues } from '@/plugins/spark/utils/configuration';
import { createBlockDialog } from '@/utils/block-dialog';
import { concatById } from '@/utils/collections';
import { createComponentDialog, createDialog } from '@/utils/dialog';
import { notify } from '@/utils/notify';
import {
  bloxQty,
  dateString,
  prettyQty,
  shortDateString,
  tempQty,
} from '@/utils/quantity';
import { PidConfig } from '../types';
import TempControlModeDialog from './TempControlModeDialog.vue';
import TempControlSyncView from './TempControlSyncView.vue';
import { TempControlMode, TempControlWidget } from './types';
import { applyMode, findControlProblems, TempControlProblem } from './utils';

const { context } = useContext.setup();
const { config, patchConfig } = useWidget.setup<TempControlWidget>();
const sparkStore = useSparkStore();

const problems = ref<TempControlProblem[]>([]);
const detected = ref<Date | null>(null);

const serviceId = computed<string | null>(() => config.value.serviceId);

const tempMode = computed<TempControlMode | null>(
  () =>
    config.value.modes.find((v) => v.id === config.value.activeMode) ?? null,
);

const coolPid = computed<PidBlock | null>(() =>
  sparkStore.blockByLink(serviceId.value, config.value.coolPid),
);

const heatPid = computed<PidBlock | null>(() =>
  sparkStore.blockByLink(serviceId.value, config.value.heatPid),
);

const differentSetpoints = computed<boolean>(() =>
  Boolean(
    sparkStore.has(serviceId.value) &&
      coolPid.value &&
      heatPid.value &&
      coolPid.value.data.inputId.id !== heatPid.value.data.inputId.id,
  ),
);

const setpoint = computed<SetpointSensorPairBlock | null>(() =>
  sparkStore.has(serviceId.value) && !differentSetpoints.value
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
  set: (value) => {
    sparkStore.patchBlock(setpoint.value, { storedSetting: value });
  },
});

const setpointEnabled = computed<boolean | null>({
  get: () => setpoint.value?.data.enabled ?? null,
  set: (value) => setControl(!!value),
});

const profile = computed<SetpointProfileBlock | null>(() =>
  sparkStore.blockByLink(serviceId.value, config.value.profile),
);

const profileEnabled = computed<boolean>({
  get: () => Boolean(setpointEnabled.value && profile.value?.data.enabled),
  set: (value) => {
    if (!profile.value || !setpoint.value) {
      return;
    }

    if (!value) {
      sparkStore.patchBlock(profile.value, { enabled: false });
      return;
    }

    createDialog({
      component: 'ConfirmDialog',
      componentProps: {
        title: 'Start profile',
        message: `
          Profile start time is ${dateString(profile.value.data.start)}.
          Do you want to reset this value to current date and time?
          `,
        nok: 'No',
        ok: 'Yes',
      },
    }).onOk(async (reset: boolean) => {
      if (!profile.value || !setpoint.value) {
        return;
      }

      await sparkStore.patchBlock(setpoint.value, {
        enabled: true,
      });
      await sparkStore.patchBlock(profile.value, {
        enabled: true,
        start: reset ? new Date().toISOString() : undefined,
      });
    });
  },
});

const profileValues = computed<ProfileValues | null>(() =>
  calculateProfileValues(profile.value),
);

function checkMismatch(
  pid: PidBlock | null,
  config: PidConfig | null | undefined,
): boolean {
  return pid && config
    ? ['kp', 'ti', 'td'].some((k) => !bloxQty(pid.data[k]).eq(config[k]))
    : false;
}

const coolConfigMismatch = computed<boolean>(() =>
  checkMismatch(coolPid.value, tempMode.value?.coolConfig),
);

const heatConfigMismatch = computed<boolean>(() =>
  checkMismatch(heatPid.value, tempMode.value?.heatConfig),
);

function applySync(kind: 'cool' | 'heat', leading: 'pid' | 'mode'): void {
  const pid = kind === 'cool' ? coolPid.value : heatPid.value;

  if (!tempMode.value || !pid) {
    return;
  }

  if (leading === 'pid') {
    const { kp, td, ti } = pid.data;
    tempMode.value[`${kind}Config`] = { kp, td, ti };
    patchConfig({ modes: concatById(config.value.modes, tempMode.value) });
  }

  if (leading === 'mode') {
    const config = tempMode.value[`${kind}Config`];
    if (config) {
      sparkStore.patchBlock(pid, config);
    }
  }
}

function pidSetpoint(pid: PidBlock | null): SetpointSensorPairBlock | null {
  return sparkStore.blockByLink(serviceId.value, pid?.data.inputId);
}

function showProfile(): void {
  createBlockDialog(profile.value);
}

async function setControl(enabled: boolean): Promise<void> {
  if (profile.value && !enabled) {
    await sparkStore.patchBlock(profile.value, {
      enabled: false,
    });
  }

  if (setpoint.value) {
    await sparkStore.patchBlock(setpoint.value, {
      enabled: enabled,
    });
  }
}

async function setControlMode(id: string): Promise<void> {
  const mode = config.value.modes.find((v) => v.id === id);

  if (!mode) {
    patchConfig({ activeMode: null });
    return;
  }

  if (!serviceId.value) {
    return;
  }

  createComponentDialog({
    component: TempControlModeDialog,
    componentProps: {
      modelValue: mode,
      serviceId: serviceId.value,
      title: `Apply ${mode.title} mode`,
      showConfirm: true,
      saveMode: (mode: TempControlMode) => {
        patchConfig({ modes: concatById(config.value.modes, mode) });
      },
    },
  }).onOk(async () => {
    let activeMode: string | null = null;
    try {
      await applyMode(config.value, mode);
      activeMode = mode.id;
      notify.done(`Applied ${mode.title} mode`);
    } catch (e: any) {
      activeMode = null;
      notify.error(e.message);
    } finally {
      patchConfig({ activeMode });
    }
  });
}

function selectControlMode(): void {
  createDialog({
    component: 'SelectDialog',
    componentProps: {
      modelValue: config.value.activeMode ?? '',
      title: 'Select control mode',
      message:
        'Pick a control mode. You can edit its settings before it is applied.',
      listSelect: true,
      selectOptions: [
        { value: '', label: 'Manual' },
        ...config.value.modes.map((v) => ({ value: v.id, label: v.title })),
      ],
    },
  }).onOk(setControlMode);
}

function troubleshoot(): void {
  problems.value = findControlProblems(config.value, {
    showConfig: () => (context.mode = 'Full'),
  });
  detected.value = new Date();
}

async function autofix(problem: TempControlProblem): Promise<void> {
  if (problem.autofix) {
    await problem.autofix(config.value);
    troubleshoot();
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
          differentSetpoints ? 'PID setpoints mismatched' : 'No setpoint set'
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
          {{ prettyQty(profileValues.prev) }} to
          {{ prettyQty(profileValues.next) }}
        </span>
        <span v-else> --- </span>
      </LabeledField>

      <LabeledField
        v-if="!profile"
        label="Setpoint Profile"
        class="col-grow"
      >
        Not set
      </LabeledField>
    </div>

    <q-item
      tag="label"
      @click="selectControlMode"
    >
      <q-item-section>
        <q-item-label>Control mode</q-item-label>
      </q-item-section>
      <q-item-section
        avatar
        class="q-pr-sm text-big"
      >
        <span
          v-if="tempMode"
          class="text-primary"
        >
          {{ tempMode.title }}
        </span>
        <span v-else> Manual </span>
      </q-item-section>
    </q-item>

    <q-item tag="label">
      <q-item-section>
        <q-item-label>Setpoint enabled</q-item-label>
      </q-item-section>
      <q-item-section avatar>
        <q-toggle v-model="setpointEnabled" />
      </q-item-section>
    </q-item>

    <q-item
      tag="label"
      :disable="!profile"
    >
      <q-item-section>
        <q-item-label>Setpoint claimed by Profile</q-item-label>
      </q-item-section>
      <q-item-section avatar>
        <q-toggle
          v-model="profileEnabled"
          :disable="!profile"
        />
      </q-item-section>
    </q-item>

    <q-item
      tag="label"
      class="col-grow"
      @click="troubleshoot"
    >
      <q-item-section>
        <q-item-label>Check for problems</q-item-label>
      </q-item-section>
      <q-item-section
        v-if="detected"
        class="fade-4 col-auto"
      >
        Last checked: {{ shortDateString(detected) }}
      </q-item-section>
      <q-item-section avatar>
        <q-icon
          name="mdi-refresh"
          class="q-pr-md"
        />
      </q-item-section>
    </q-item>

    <div
      v-if="detected"
      class="column q-gutter-y-sm q-px-sm"
    >
      <LabeledField
        v-for="(problem, idx) in problems"
        :key="`problem-${detected}-${idx}`"
        :label="problem.autofix ? 'Click to fix' : 'Please fix manually'"
        :readonly="!problem.autofix"
        :class="[
          'row items-center',
          !problem.autofix && 'cursor-not-allowed dashed',
        ]"
        tag-class="row"
        @click="autofix(problem)"
      >
        <template #before>
          <q-icon
            name="warning"
            color="warning"
            size="lg"
          />
        </template>
        <div v-html="problem.desc" />
      </LabeledField>
    </div>

    <TempControlSyncView
      v-if="coolPid && tempMode && tempMode.coolConfig && coolConfigMismatch"
      :block-config="coolPid.data"
      :mode-config="tempMode.coolConfig"
      @apply="(v) => applySync('cool', v)"
    >
      <template #message>
        Settings in cool PID do not match settings stored in
        {{ tempMode.title }} mode.
      </template>
    </TempControlSyncView>

    <TempControlSyncView
      v-if="heatPid && tempMode && tempMode.heatConfig && heatConfigMismatch"
      :block-config="heatPid.data"
      :mode-config="tempMode.heatConfig"
      @apply="(v) => applySync('heat', v)"
    >
      <template #message>
        Settings in heat PID do not match settings stored in
        {{ tempMode.title }} mode.
      </template>
    </TempControlSyncView>
  </div>
</template>
