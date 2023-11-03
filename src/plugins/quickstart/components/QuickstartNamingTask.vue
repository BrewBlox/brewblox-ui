<script setup lang="ts">
import { QuickstartConfig } from '../types';
import { withPrefix } from '../utils';
import { makeBlockIdRules } from '@/plugins/spark/utils/configuration';
import { makeDashboardIdRules } from '@/utils/dashboards';
import { makeRuleValidator, suggestId } from '@/utils/rules';
import { makeUrlSafe } from '@/utils/url';
import mapValues from 'lodash/mapValues';
import { computed, reactive } from 'vue';

interface Props {
  config: QuickstartConfig;
  defaultNames: { readonly [k: string]: string };
  defaultPrefix: string;
  defaultDashboardTitle: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:config': [data: QuickstartConfig];
  back: [];
  next: [];
}>();

const customNames = reactive<AnyDict>({});

const serviceId = computed<string>(() => props.config.serviceId);

function updateConfig(cfg: Partial<QuickstartConfig>): void {
  emit('update:config', { ...props.config, ...cfg });
}

const prefix = computed<string>({
  get: () => props.config.prefix ?? props.defaultPrefix,
  set: (prefix) => updateConfig({ prefix }),
});

const dashboardTitle = computed<string>({
  get: () => props.config.dashboardTitle ?? props.defaultDashboardTitle,
  set: (dashboardTitle) => updateConfig({ dashboardTitle }),
});

const dashboardIdRules = makeDashboardIdRules();
const dashboardIdValidator = makeRuleValidator(dashboardIdRules);

const dashboardId = computed<string>({
  get: () =>
    props.config.dashboardId ??
    suggestId(makeUrlSafe(dashboardTitle.value), dashboardIdValidator),
  set: (dashboardId) => updateConfig({ dashboardId }),
});

// We want to avoid circular references between
// validator and the `actualNames` computed property
// These rules do not yet check for duplicates
const limitedNameRules = computed<InputRule[]>(() =>
  makeBlockIdRules(serviceId.value),
);

const actualNames = computed<AnyDict>(() => ({
  ...mapValues(props.defaultNames, (v) =>
    suggestId(
      withPrefix(prefix.value, v),
      makeRuleValidator(limitedNameRules.value),
    ),
  ),
  ...customNames,
}));

const nameRules = computed<InputRule[]>(() => [
  ...limitedNameRules.value,
  (v) =>
    Object.values(actualNames.value).filter((n) => n === v).length < 2 ||
    "Name can't be a duplicate",
]);

const nameValidator = computed<(v: any) => boolean>(() =>
  makeRuleValidator(nameRules.value),
);

const valuesOk = computed<boolean>(() =>
  [
    dashboardTitle,
    dashboardIdValidator(dashboardId.value),
    Object.values(actualNames.value).every(nameValidator.value),
  ].every(Boolean),
);

function updateName(key: string, val: string): void {
  customNames[key] = val.trim();
}

function clearKey(key: keyof QuickstartConfig): void {
  updateConfig({ [key]: undefined });
}

function clearName(key: string): void {
  delete customNames[key];
}

function taskDone(): void {
  if (!valuesOk.value) {
    return;
  }
  updateConfig({
    prefix: prefix.value,
    names: actualNames.value,
    dashboardId: dashboardId.value,
    dashboardTitle: dashboardTitle.value,
  });
  emit('next');
}
</script>

<template>
  <QuickstartCard>
    <q-card-section>
      <q-item class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Name your new dashboard and blocks
          </q-item-label>
        </q-item-section>
      </q-item>

      <!-- Dashboard title -->
      <QuickstartNameField
        v-model="dashboardTitle"
        label="Dashboard name"
        @clear="clearKey('dashboardTitle')"
      >
        <template #help> The name for the new dashboard. </template>
      </QuickstartNameField>

      <!-- Overall prefix -->
      <QuickstartPrefixField
        v-model="prefix"
        @clear="clearKey('prefix')"
      />

      <!-- Automatically generated names -->
      <q-expansion-item
        label="Generated names"
        icon="mdi-tag-multiple"
        dense
      >
        <!-- Dashboard ID -->
        <QuickstartNameField
          v-model="dashboardId"
          label="Dashboard ID"
          :rules="dashboardIdRules"
          @clear="clearKey('dashboardId')"
        >
          <template #help>
            The unique identifier for your dashboard.
            <br />
            By default, this is an URL-safe version of the dashboard title.
          </template>
        </QuickstartNameField>
        <!-- Block names -->
        <QuickstartNameField
          v-for="(nVal, nKey) in actualNames"
          :key="nKey"
          :model-value="nVal"
          :label="defaultNames[nKey]"
          :rules="nameRules"
          @clear="clearName(nKey)"
          @update:model-value="(v) => updateName(nKey, v)"
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
  </QuickstartCard>
</template>
