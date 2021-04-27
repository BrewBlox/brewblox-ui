<script lang="ts">
import mapValues from 'lodash/mapValues';
import UrlSafeString from 'url-safe-string';
import { computed, defineComponent, PropType, reactive } from 'vue';

import { blockIdRules } from '@/plugins/spark/utils';
import { dashboardIdRules } from '@/utils/dashboards';
import { ruleValidator, suggestId } from '@/utils/functional';

import { withPrefix } from '../utils';
import { HermsBlockNames, HermsConfig } from './types';

const defaultNames: HermsBlockNames = {
  hltSensor: 'HLT Sensor',
  hltDriver: 'HLT Setpoint Driver',
  hltSetpoint: 'HLT Setpoint',
  hltPid: 'HLT PID',
  hltPwm: 'HLT PWM',
  hltAct: 'HLT Actuator',
  mtSensor: 'MT Sensor',
  mtSetpoint: 'MT Setpoint',
  mtPid: 'MT PID',
  bkSensor: 'BK Sensor',
  bkSetpoint: 'BK Setpoint',
  bkPid: 'BK PID',
  bkPwm: 'BK PWM',
  bkAct: 'BK Actuator',
  mutex: 'Mutex',
  balancer: 'Balancer',
};

export default defineComponent({
  name: 'HermsNamingTask',
  props: {
    config: {
      type: Object as PropType<HermsConfig>,
      required: true,
    },
  },
  emits: [
    'update:config',
    'back',
    'next',
  ],
  setup(props, { emit }) {
    const chosenNames = reactive<Partial<HermsBlockNames>>({});
    const idGenerator = new UrlSafeString();

    const serviceId = computed<string>(
      () => props.config.serviceId,
    );

    function updateConfig(cfg: Partial<HermsConfig>): void {
      emit('update:config', { ...props.config, ...cfg });
    }

    const prefix = computed<string>({
      get: () => props.config.prefix ?? 'HERMS',
      set: prefix => updateConfig({ prefix }),
    });

    const dashboardTitle = computed<string>({
      get: () => props.config.dashboardTitle ?? 'HERMS',
      set: dashboardTitle => updateConfig({ dashboardTitle }),
    });

    const dashboardIdValidator = ruleValidator(dashboardIdRules());

    const dashboardId = computed<string>({
      get: () => props.config.dashboardId
        ?? suggestId(idGenerator.generate(dashboardTitle.value), dashboardIdValidator),
      set: dashboardId => updateConfig({ dashboardId }),
    });

    const nameRules = computed<InputRule[]>(
      () => blockIdRules(serviceId.value),
    );

    const nameValidator = computed<(v: any) => boolean>(
      () => ruleValidator(nameRules.value),
    );

    const names = computed<HermsBlockNames>(
      () => ({
        ...mapValues(
          defaultNames,
          v => suggestId(withPrefix(prefix.value, v), nameValidator.value),
        ),
        ...chosenNames,
      }),
    );

    const duplicateNameRules = computed<InputRule[]>(
      () => [
        v => Object.values(names.value)
          .filter(n => n === v).length < 2 || "Name can't be a duplicate",
      ],
    );

    const duplicateNameValidator = computed<(v: any) => boolean>(
      () => ruleValidator(duplicateNameRules.value),
    );

    const valuesOk = computed<boolean>(
      () =>
        [
          dashboardTitle,
          dashboardIdValidator(dashboardId.value),
          Object.values(names.value)
            .every(n => nameValidator.value(n) && duplicateNameValidator.value(n)),
        ]
          .every(Boolean),
    );

    function updateName(key: string, val: string): void {
      chosenNames[key] = val.trim();
    }

    function clearKey(key: keyof HermsConfig): void {
      updateConfig({ [key]: undefined });
    }

    function clearName(key: string): void {
      delete chosenNames[key];
    }

    function taskDone(): void {
      if (!valuesOk.value) {
        return;
      }
      updateConfig({
        prefix: prefix.value,
        dashboardId: dashboardId.value,
        dashboardTitle: dashboardTitle.value,
        names: names.value,
        widgets: [],
        createdBlocks: [],
        changedBlocks: [],
        renamedBlocks: {},
      });
      emit('next');
    }

    return {
      defaultNames,
      dashboardIdRules,
      serviceId,
      prefix,
      dashboardTitle,
      dashboardId,
      nameRules,
      names,
      duplicateNameRules,
      valuesOk,
      updateName,
      clearKey,
      clearName,
      taskDone,
    };
  },
});
</script>

<template>
  <ActionCardBody>
    <q-card-section>
      <q-item class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Name your new dashboard and blocks
          </q-item-label>
        </q-item-section>
      </q-item>

      <!-- Generic settings -->
      <QuickstartNameField
        v-model="dashboardTitle"
        label="Dashboard name"
        @clear="clearKey('dashboardTitle')"
      >
        <template #help>
          The name for the new dashboard.
        </template>
      </QuickstartNameField>
      <QuickstartNameField
        v-model="dashboardId"
        label="Unique dashboard ID"
        :rules="dashboardIdRules"
        @clear="clearKey('dashboardId')"
      >
        <template #help>
          The unique identifier for your dashboard.
          <br> By default, this is an URL-safe version of the dashboard title.
        </template>
      </QuickstartNameField>
      <QuickstartPrefixField
        v-model="prefix"
        @clear="clearKey('prefix')"
      />

      <!-- Block names -->
      <q-expansion-item label="Block names (click to expand)" icon="mdi-tag-multiple" dense>
        <QuickstartNameField
          v-for="(nVal, nKey) in names"
          :key="nKey"
          :model-value="nVal"
          :label="defaultNames[nKey]"
          :rules="nameRules"
          @clear="clearName(nKey)"
          @update:model-value="v => updateName(nKey, v)"
        />
      </q-expansion-item>
    </q-card-section>

    <template #actions>
      <q-btn
        unelevated
        label="Back"
        @click="$emit('back')"
      />
      <q-space />
      <q-btn
        :disable="!valuesOk"
        unelevated
        label="Next"
        color="primary"
        @click="taskDone"
      />
    </template>
  </ActionCardBody>
</template>
