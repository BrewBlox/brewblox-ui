<script lang="ts">
import isString from 'lodash/isString';
import { nanoid } from 'nanoid';
import { computed, defineComponent, ref } from 'vue';

import { dashboardStore } from '@/store/dashboards';
import { featureStore } from '@/store/features';
import { systemStore } from '@/store/system';
import { Widget, widgetStore } from '@/store/widgets';
import { ruleErrorFinder } from '@/utils/functional';
import { loadFile } from '@/utils/import-export';
import notify from '@/utils/notify';

import { useWizard } from '../composables';

const widgetRules: InputRule[] = [
  v => v !== null || 'Widget must have a value',
  v => isString(v.title) || 'Widget must have a title',
  v => isString(v.feature) || 'Widget must have a type',
  v => featureStore.widgetIds.includes(v.feature) || 'Widget type is unknown',
  v => !!v.config || 'Widget must have config settings',
];

const errorFinder = ruleErrorFinder(widgetRules);

export default defineComponent({
  name: 'ImportWizard',
  props: {
    ...useWizard.props,
    dashboardId: {
      type: String,
      default: '',
    },
  },
  emits: [
    ...useWizard.emits,
  ],
  setup(props) {
    const {
      onBack,
      onDone,
      setDialogTitle,
    } = useWizard.setup();

    setDialogTitle('Import wizard');

    const widget = ref<Widget | null>(null);

    const primaryDashboardId = computed<string | null>(
      () => {
        const { homePage } = systemStore.config;
        if (!homePage || !homePage.startsWith('/dashboard')) {
          return null;
        }
        return homePage.split('/')[2] ?? null;
      },
    );

    const _chosenDashboardId = ref<string>('');
    const chosenDashboardId = computed<string>({
      get: () => _chosenDashboardId.value
        || props.dashboardId
        || primaryDashboardId.value
        || dashboardStore.dashboardIds[0]
        || '',
      set: id => _chosenDashboardId.value = id,
    });

    const dashboardOpts = computed<SelectOption<string>[]>(
      () => dashboardStore.dashboards
        .map(dash => ({ label: dash.title, value: dash.id })),
    );

    const widgetError = computed<string | null>(
      () => errorFinder(widget.value),
    );

    const widgetOk = computed<boolean>(
      () => widgetError.value === null,
    );

    const featureTitle = computed<string>(
      () => widget.value !== null
        ? featureStore.widgetTitle(widget.value.feature)
        : '',
    );

    const widgetString = computed<string>(
      () => widget.value === null
        ? ''
        : (widgetError.value
          || `[${featureTitle.value}] ${widget.value.title}`),
    );

    const valuesOk = computed<boolean>(
      () => !!chosenDashboardId.value && widgetOk.value,
    );

    async function createWidget(): Promise<void> {
      if (widget.value === null) { return; }
      try {
        await widgetStore.appendWidget({
          ...widget.value,
          id: nanoid(),
          dashboard: chosenDashboardId.value,
        });
        notify.done(`Created ${featureTitle.value} <b>${widget.value.title}</b>`);
        onDone({ widget: widget.value });
      } catch (e) {
        notify.error(`Failed to create widget: ${e.toString()}`);
      }
    }

    function startImport(): void {
      loadFile<Widget>(v => widget.value = v);
    }

    return {
      onBack,
      widget,
      chosenDashboardId,
      dashboardOpts,
      widgetError,
      widgetOk,
      widgetString,
      valuesOk,
      createWidget,
      startImport,
    };
  },
});
</script>

<template>
  <ActionCardBody>
    <q-card-section>
      <LabeledField v-if="dashboardOpts.length <= 5" label="Dashboard" item-aligned>
        <q-option-group
          v-model="chosenDashboardId"
          :options="dashboardOpts"
          label="test"
        />
      </LabeledField>
      <q-select
        v-else
        v-model="chosenDashboardId"
        :options="dashboardOpts"
        label="Dashboard"
        map-options
        emit-value
        item-aligned
      />
      <q-item>
        <q-item-section>
          <q-input
            label="Loaded widget"
            readonly
            :value="widgetString"
            :error-message="widgetError"
            :error="widget !== null && !widgetOk"
          />
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn flat label="Load" @click="startImport" />
        </q-item-section>
      </q-item>
    </q-card-section>

    <template #actions>
      <q-btn
        unelevated
        label="Back"
        @click="onBack"
      />
      <q-space />
      <q-btn
        :disable="!valuesOk"
        unelevated
        label="Create"
        color="primary"
        @click="createWidget"
      />
    </template>
  </ActionCardBody>
</template>
