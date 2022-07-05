<script lang="ts">
import isString from 'lodash/isString';
import { nanoid } from 'nanoid';
import { computed, defineComponent, ref } from 'vue';

import { useDashboardStore } from '@/store/dashboards';
import { useFeatureStore } from '@/store/features';
import { Widget, useWidgetStore } from '@/store/widgets';
import { userUISettings } from '@/user-settings';
import { loadFile } from '@/utils/import-export';
import { notify } from '@/utils/notify';
import { makeRuleValidator } from '@/utils/rules';

import { useWizard } from '../composables';

const widgetRules: InputRule[] = [
  (v) => v !== null || 'Widget must have a value',
  (v) => isString(v.title) || 'Widget must have a title',
  (v) => isString(v.feature) || 'Widget must have a type',
  (v) =>
    useFeatureStore().widgetIds.includes(v.feature) || 'Widget type is unknown',
  (v) => !!v.config || 'Widget must have config settings',
];

const validator = makeRuleValidator(widgetRules, 'error');

export default defineComponent({
  name: 'ImportWizard',
  props: {
    ...useWizard.props,
    dashboardId: {
      type: String,
      default: '',
    },
  },
  emits: [...useWizard.emits],
  setup(props) {
    const widgetStore = useWidgetStore();
    const dashboardStore = useDashboardStore();
    const featureStore = useFeatureStore();
    const { onBack, onDone, setDialogTitle } = useWizard.setup();

    setDialogTitle('Import wizard');

    const widget = ref<Widget | null>(null);

    const primaryDashboardId = computed<string | null>(() => {
      const { homePage } = userUISettings.value;
      if (!homePage || !homePage.startsWith('/dashboard')) {
        return null;
      }
      return homePage.split('/')[2] ?? null;
    });

    const _chosenDashboardId = ref<string>('');
    const chosenDashboardId = computed<string>({
      get: () =>
        _chosenDashboardId.value ||
        props.dashboardId ||
        primaryDashboardId.value ||
        dashboardStore.dashboardIds[0] ||
        '',
      set: (id) => (_chosenDashboardId.value = id),
    });

    const dashboardOpts = computed<SelectOption<string>[]>(() =>
      dashboardStore.dashboards.map((dash) => ({
        label: dash.title,
        value: dash.id,
      })),
    );

    const widgetError = computed<string | undefined>(
      () => validator(widget.value) ?? undefined,
    );

    const widgetOk = computed<boolean>(() => widgetError.value === null);

    const featureTitle = computed<string>(() =>
      widget.value !== null
        ? featureStore.widgetTitle(widget.value.feature)
        : '',
    );

    const widgetString = computed<string>(() =>
      widget.value === null
        ? ''
        : widgetError.value || `[${featureTitle.value}] ${widget.value.title}`,
    );

    const valuesOk = computed<boolean>(
      () => !!chosenDashboardId.value && widgetOk.value,
    );

    async function createWidget(): Promise<void> {
      if (widget.value === null) {
        return;
      }
      try {
        await widgetStore.appendWidget({
          ...widget.value,
          id: nanoid(),
          dashboard: chosenDashboardId.value,
        });
        notify.done(
          `Created ${featureTitle.value} <b>${widget.value.title}</b>`,
        );
        onDone({ widget: widget.value });
      } catch (e: any) {
        notify.error(`Failed to create widget: ${e.toString()}`);
      }
    }

    function startImport(): void {
      loadFile<Widget>((v) => (widget.value = v));
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
  <WizardBody>
    <q-card-section>
      <LabeledField
        v-if="dashboardOpts.length <= 5"
        label="Dashboard"
        item-aligned
      >
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
            :model-value="widgetString"
            :error-message="widgetError"
            :error="widget !== null && !widgetOk"
          />
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn
            flat
            label="Load"
            @click="startImport"
          />
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
  </WizardBody>
</template>
