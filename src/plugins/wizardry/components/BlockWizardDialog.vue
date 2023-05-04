<script setup lang="ts">
import { useDialog, useGlobals } from '@/composables';
import { SPARK_SERVICE_TYPE } from '@/plugins/spark/const';
import { useBlockSpecStore } from '@/plugins/spark/store';
import {
  BlockSpec,
  BlockWidget,
  ComparedBlockType,
} from '@/plugins/spark/types';
import { makeBlockIdRules } from '@/plugins/spark/utils/configuration';
import { isCompatible, isSystemBlockType } from '@/plugins/spark/utils/info';
import { useDashboardStore } from '@/store/dashboards';
import { useFeatureStore } from '@/store/features';
import { useServiceStore } from '@/store/services';
import { useWidgetStore } from '@/store/widgets';
import { startCreateDashboard } from '@/utils/dashboards';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import { typed } from '@/utils/misc';
import { makeRuleValidator, suggestId } from '@/utils/rules';
import { BlockType } from 'brewblox-proto/ts';
import { nanoid } from 'nanoid';
import { computed, nextTick, PropType, ref } from 'vue';
import { tryCreateBlock } from '../utils';

interface BlockOption extends SelectOption<BlockType> {
  generate: BlockSpec['generate'];
}

type ServiceOption = SelectOption<string>;
type DashboardOption = SelectOption<string>;

type WizardStep = 'block' | 'service' | 'name' | 'dashboard';

const props = defineProps({
  ...useDialog.props,
  compatible: {
    type: null as unknown as PropType<ComparedBlockType>,
    default: null,
  },
  filter: {
    type: Function as PropType<(type: BlockType) => boolean>,
    default: () => true,
  },
  serviceId: {
    type: null as unknown as PropType<string | null>,
    default: null,
  },
  showCreated: {
    type: Boolean,
    default: true,
  },
  addWidget: {
    type: Boolean,
    default: false,
  },
});

defineEmits({ ...useDialog.emitsObject });

const { dialogRef, dialogProps, onDialogHide, onDialogOK } = useDialog.setup();
const { dense } = useGlobals.setup();
const dashboardStore = useDashboardStore();
const widgetStore = useWidgetStore();
const featureStore = useFeatureStore();
const labelSorter = makeObjectSorter('label');
const blockSpecStore = useBlockSpecStore();
const serviceStore = useServiceStore();

const step = ref<WizardStep>('block');
const search = ref<string | null>('');
const selectedBlockOpt = ref<BlockOption | null>(null);
const selectedServiceOpt = ref<ServiceOption | null>(null);
const selectedDashboardOpt = ref<DashboardOption | null>(null);
const newBlockId = ref<string>('');
const finishBusy = ref<boolean>(false);

const allBlockOpts = computed<BlockOption[]>(() =>
  blockSpecStore.blockSpecs
    .filter(
      (spec) =>
        !isSystemBlockType(spec.type) &&
        isCompatible(spec.type, props.compatible) &&
        props.filter(spec.type),
    )
    .map(
      (spec): BlockOption => ({
        value: spec.type,
        label: spec.title,
        generate: spec.generate,
      }),
    )
    .sort(labelSorter),
);

const blockOpts = computed<BlockOption[]>(() => {
  const exp = new RegExp(search.value ?? '', 'i');
  return allBlockOpts.value.filter((opt) =>
    exp.test(`${opt.value} ${opt.label}`),
  );
});

const serviceOpts = computed<ServiceOption[]>(() =>
  serviceStore.services
    .filter((svc) => svc.type === SPARK_SERVICE_TYPE)
    .filter((svc) => !props.serviceId || svc.id === props.serviceId)
    .map((svc) => ({
      label: svc.title,
      value: svc.id,
    })),
);

const dashboardOpts = computed<DashboardOption[]>(() =>
  dashboardStore.dashboards.map((v) => ({ value: v.id, label: v.title })),
);

const activeBlockIdRules = computed<InputRule[]>(() =>
  selectedServiceOpt.value
    ? makeBlockIdRules(selectedServiceOpt.value.value)
    : [() => 'No service selected'],
);

const blockIdValidator = computed<(v: any) => boolean>(() =>
  makeRuleValidator(activeBlockIdRules.value),
);

const canAdvance = computed<boolean>(() => {
  switch (step.value) {
    case 'block':
      return selectedBlockOpt.value != null;
    case 'service':
      return selectedServiceOpt.value != null;
    case 'name':
      return blockIdValidator.value(newBlockId.value);
    case 'dashboard':
      return true;
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

function showBlockIdKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: newBlockId.value,
      rules: activeBlockIdRules.value,
    },
  }).onOk((v: string) => (newBlockId.value = v));
}

async function finish(): Promise<void> {
  if (
    !selectedBlockOpt.value ||
    !selectedServiceOpt.value ||
    !blockIdValidator.value(newBlockId.value)
  ) {
    return;
  }

  const blockId = newBlockId.value;
  const serviceId = selectedServiceOpt.value.value;
  const type = selectedBlockOpt.value.value;

  finishBusy.value = true;

  if (selectedDashboardOpt.value) {
    widgetStore.appendWidget(
      typed<BlockWidget>({
        id: nanoid(),
        title: blockId,
        feature: type,
        dashboard: selectedDashboardOpt.value.value,
        order: 0,
        config: {
          blockId,
          serviceId,
        },
        ...featureStore.widgetSize(type),
      }),
    );
  }

  const created = await tryCreateBlock({
    id: blockId,
    serviceId,
    type,
    data: selectedBlockOpt.value.generate(),
  });

  if (created && props.showCreated) {
    createDialog({
      component: 'BlockWidgetDialog',
      componentProps: {
        blockId,
        serviceId,
      },
    });
  }

  onDialogOK(created);
}

function back(): void {
  switch (step.value) {
    case 'block':
      selectedBlockOpt.value = null;
      selectedServiceOpt.value = null;
      selectedDashboardOpt.value = null;
      newBlockId.value = '';
      break;
    case 'service':
      step.value = 'block';
      break;
    case 'name':
      step.value = 'service';
      break;
    case 'dashboard':
      step.value = 'name';
      break;
    default:
      step.value = 'block';
  }
}

function next(): void {
  if (!canAdvance.value) {
    return;
  }

  switch (step.value) {
    case 'block':
      step.value = 'service';
      break;

    case 'service':
      if (!newBlockId.value) {
        newBlockId.value = suggestId(
          selectedBlockOpt.value!.label,
          blockIdValidator.value,
        );
      }
      step.value = 'name';
      break;

    case 'name':
      if (props.addWidget) {
        step.value = 'dashboard';
      } else {
        finish();
      }
      break;

    case 'dashboard':
      finish();
      break;

    default:
      step.value = 'block';
  }
}

function confirmBlockOpt(opt: BlockOption): void {
  selectedBlockOpt.value = opt;
  nextTick(() => next()); // wait for computed
}

function confirmServiceOpt(opt: ServiceOption): void {
  selectedServiceOpt.value = opt;
  nextTick(() => next()); // wait for computed
}

function confirmDashboardOpt(opt: DashboardOption): void {
  selectedDashboardOpt.value = opt;
  nextTick(() => next()); // wait for computed
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    :maximized="dense"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="next"
  >
    <Card>
      <template #toolbar>
        <Toolbar
          icon="mdi-creation"
          title="New block"
        />
      </template>

      <q-stepper
        v-model="step"
        flat
      >
        <q-step
          name="block"
          title="Type"
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
            v-model="selectedBlockOpt"
            :options="blockOpts"
            option-value="value"
            option-label="label"
            @confirm="confirmBlockOpt"
          />
        </q-step>

        <q-step
          name="service"
          title="Service"
        >
          <ListSelect
            v-model="selectedServiceOpt"
            :options="serviceOpts"
            option-value="value"
            option-label="label"
            @confirm="confirmServiceOpt"
          />
        </q-step>

        <q-step
          name="name"
          title="Name"
        >
          <q-input
            v-model="newBlockId"
            :rules="activeBlockIdRules"
            label="Block name"
          >
            <template #append>
              <KeyboardButton @click="showBlockIdKeyboard" />
              <q-icon name="mdi-information">
                <q-tooltip>
                  The name of the Spark Controller block. <br />
                  Multiple widgets can display the same block. <br />
                  Rules:
                  <ul>
                    <li>The name must not be empty.</li>
                    <li>The name must be unique.</li>
                    <li>The name must begin with a letter.</li>
                    <li>
                      The name may only contain alphanumeric characters, space,
                      and _-()|.
                    </li>
                    <li>The name must be less than 200 characters.</li>
                  </ul>
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>
        </q-step>

        <q-step
          v-if="addWidget"
          name="dashboard"
          title="Dashboard"
        >
          <ListSelect
            v-model="selectedDashboardOpt"
            :options="dashboardOpts"
            option-value="value"
            option-label="label"
            @confirm="confirmDashboardOpt"
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
          :label="step === 'block' ? 'Clear' : 'Back'"
          @click="back"
        />
        <q-space />
        <q-btn
          :disable="!canAdvance"
          :loading="finishBusy"
          :label="
            (addWidget ? step === 'dashboard' : step === 'name')
              ? 'Finish'
              : 'Next'
          "
          unelevated
          color="primary"
          @click="next"
        />
      </template>
    </Card>
  </q-dialog>
</template>
