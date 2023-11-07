<script setup lang="ts">
import { tryCreateWidget } from '../utils';
import {
  UseDialogEmits,
  UseDialogProps,
  useDialog,
  useGlobals,
  useRouteId,
} from '@/composables';
import { useDashboardStore } from '@/store/dashboards';
import {
  ComponentName,
  useFeatureStore,
  WidgetFeature,
} from '@/store/features';
import { Widget } from '@/store/widgets';
import { userUISettings } from '@/user-settings';
import { startCreateDashboard } from '@/utils/dashboards';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import { nanoid } from 'nanoid';
import { computed, nextTick, onMounted, ref } from 'vue';

interface FeatureOption extends SelectOption<string> {
  editor: ComponentName;
  badge: string | null;
}

type DashboardOption = SelectOption<string>;

type WizardStep = 'widget' | 'editor' | 'dashboard';

interface Props extends UseDialogProps {
  featureId?: string;
  dashboardId?: string;
  filter?: (feature: string) => boolean;
  showCreated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  filter: () => true,
  showCreated: true,
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogOK } =
  useDialog.setup<Widget | null>();
const { dense } = useGlobals.setup();
const { activeDashboardId } = useRouteId.setup();
const dashboardStore = useDashboardStore();
const featureStore = useFeatureStore();
const labelSorter = makeObjectSorter('label');

const id = nanoid();
const step = ref<WizardStep>('widget');
const search = ref<string | null>('');
const selectedFeatureOpt = ref<FeatureOption | null>(null);
const selectedDashboardOpt = ref<DashboardOption | null>(null);
const widget = ref<Widget | null>(null);
const widgetValid = ref<boolean>(false);
const finishBusy = ref<boolean>(false);

const experimental = computed<boolean>(() => userUISettings.value.experimental);

const allFeatureOpts = computed<FeatureOption[]>(() =>
  featureStore.widgets
    .filter(
      (feature) =>
        (experimental.value || !feature.experimental) &&
        feature.creatable !== false &&
        (!props.featureId || props.featureId === feature.id) &&
        props.filter(feature.id),
    )
    .map(
      (feature): FeatureOption => ({
        label: feature.title,
        value: feature.id,
        editor: feature.editor ?? 'GenericWidgetEditor',
        badge: feature.experimental ? 'experimental' : null,
      }),
    )
    .sort(labelSorter),
);

const featureOpts = computed<FeatureOption[]>(() => {
  const exp = new RegExp(search.value ?? '', 'i');
  return allFeatureOpts.value.filter((opt) =>
    exp.test(`${opt.value} ${opt.label}`),
  );
});

const feature = computed<WidgetFeature | null>(() =>
  featureStore.widgetById(selectedFeatureOpt.value?.value),
);

const dashboardOpts = computed<DashboardOption[]>(() =>
  dashboardStore.dashboards
    .filter((v) => !props.dashboardId || v.id === props.dashboardId)
    .map((v) => ({ value: v.id, label: v.title })),
);

const canFinish = computed<boolean>(
  () =>
    widget.value != null &&
    selectedDashboardOpt.value != null &&
    dashboardStore.dashboardIds.includes(selectedDashboardOpt.value.value),
);

const canAdvance = computed<boolean>(() => {
  switch (step.value) {
    case 'widget':
      return selectedFeatureOpt.value != null;
    case 'editor':
      return widget.value != null && widgetValid.value;
    case 'dashboard':
      return canFinish.value;
    default:
      return false;
  }
});

function showSearchKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: search.value,
    },
  }).onOk((v: string) => (search.value = v));
}

function prepareWidget(): boolean {
  if (!feature.value) {
    return false;
  }
  if (widget.value?.feature !== feature.value.id) {
    widget.value = {
      ...feature.value.widgetSize,
      id,
      feature: feature.value.id,
      title: feature.value.title,
      dashboard: '',
      order: 0,
      config: feature.value.generateConfig!(),
    };
  }
  return true;
}

async function finish(): Promise<void> {
  if (!widget.value || !selectedDashboardOpt.value) {
    return;
  }
  finishBusy.value = true;
  widget.value.dashboard = selectedDashboardOpt.value.value;
  const created = await tryCreateWidget(widget.value);
  if (created && props.showCreated) {
    createDialog({
      component: 'WidgetDialog',
      componentProps: {
        widgetId: created.id,
        mode: 'Full',
      },
    });
  }

  onDialogOK(created);
}

function back(): void {
  switch (step.value) {
    case 'widget':
      selectedFeatureOpt.value = null;
      selectedDashboardOpt.value = null;
      widget.value = null;
      widgetValid.value = false;
      break;
    case 'editor':
      step.value = 'widget';
      break;
    case 'dashboard':
      step.value = 'editor';
      break;
    default:
      step.value = 'widget';
  }
}

function next(): void {
  if (!canAdvance.value) {
    return;
  }

  switch (step.value) {
    case 'widget':
      if (prepareWidget()) {
        step.value = 'editor';
      }
      break;

    case 'editor':
      step.value = 'dashboard';
      break;

    case 'dashboard':
      finish();
      break;

    default:
      step.value = 'widget';
  }
}

onMounted(() => {
  selectedDashboardOpt.value =
    dashboardOpts.value.find((opt) => opt.value === activeDashboardId.value) ??
    null;
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    :maximized="dense"
    v-bind="dialogOpts"
    @hide="onDialogHide"
    @keyup.enter="next"
  >
    <Card>
      <template #toolbar>
        <Toolbar
          icon="mdi-creation"
          title="New widget"
        />
      </template>

      <q-stepper
        v-model="step"
        flat
      >
        <q-step
          name="widget"
          title="Widget"
        >
          <q-input
            v-model="search"
            placeholder="Search"
            clearable
            autofocus
            class="q-mb-md"
          >
            <template #append>
              <KeyboardButton @click="showSearchKeyboard" />
              <q-icon name="search" />
            </template>
          </q-input>
          <ListSelect
            v-model="selectedFeatureOpt"
            :options="featureOpts"
            option-value="value"
            option-label="label"
            @confirm="
              (opt) => {
                selectedFeatureOpt = opt;
                nextTick(() => next());
              }
            "
          />
        </q-step>

        <q-step
          name="editor"
          title="Settings"
        >
          <component
            :is="selectedFeatureOpt.editor"
            v-if="selectedFeatureOpt && widget"
            v-model:widget="widget"
            v-model:valid="widgetValid"
            :feature-type="selectedFeatureOpt.value"
            :feature-title="selectedFeatureOpt.label"
          />
        </q-step>

        <q-step
          name="dashboard"
          title="Dashboard"
        >
          <ListSelect
            v-model="selectedDashboardOpt"
            :options="dashboardOpts"
            option-value="value"
            option-label="label"
            @confirm="
              (opt) => {
                selectedDashboardOpt = opt;
                nextTick(() => next());
              }
            "
          />
          <div class="column q-pt-md">
            <q-btn
              flat
              color="secondary"
              icon="add"
              label="New dashboard"
              class="self-end"
              @click="startCreateDashboard(null)"
            />
          </div>
        </q-step>
      </q-stepper>

      <template #actions>
        <q-btn
          unelevated
          :label="step === 'widget' ? 'Clear' : 'Back'"
          @click="back"
        />
        <q-space />
        <q-btn
          :disable="!canAdvance"
          :loading="finishBusy"
          :label="step === 'dashboard' ? 'Finish' : 'Next'"
          unelevated
          color="primary"
          @click="next"
        />
      </template>
    </Card>
  </q-dialog>
</template>
