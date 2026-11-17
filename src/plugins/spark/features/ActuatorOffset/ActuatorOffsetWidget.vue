<script setup lang="ts">
import {
  ActuatorOffsetBlock,
  AnalogConstraints,
  Link,
  Quantity,
  ReferenceKind,
} from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { createComponentDialog } from '@/utils/dialog';
import { fixedNumber, prettyLink } from '@/utils/quantity';
import ActuatorOffsetDisableDialog from './ActuatorOffsetDisableDialog.vue';

const referenceOpts: SelectOption<ReferenceKind>[] = [
  { label: 'Setting', value: ReferenceKind.REF_SETTING },
  { label: 'Measured', value: ReferenceKind.REF_VALUE },
];

const { context, inDialog } = useContext.setup();
const sparkStore = useSparkStore();
const { serviceId, block, patchBlock, isClaimed } =
  useBlockWidget.setup<ActuatorOffsetBlock>();

const target = computed<Link>({
  get: () => block.value.data.targetId,
  set: (v) => patchBlock({ targetId: v }),
});

const reference = computed<Link>({
  get: () => block.value.data.referenceId,
  set: (v) => patchBlock({ referenceId: v }),
});

const refKind = computed<ReferenceKind>({
  get: () => block.value.data.referenceSettingOrValue,
  set: (v) => patchBlock({ referenceSettingOrValue: v }),
});

const refKindLabel = computed<string>(
  () => referenceOpts.find((v) => v.value === refKind.value)?.label ?? '???',
);

const desiredSetting = computed<Quantity>({
  get: () => block.value.data.desiredSetting,
  set: (v) => patchBlock({ storedSetting: v }),
});

const constraints = computed<AnalogConstraints>({
  get: () => block.value.data.constraints ?? {},
  set: (v) => patchBlock({ constraints: v }),
});

const isLimited = computed<boolean>(() => {
  const { enabled, desiredSetting, setting } = block.value.data;
  return (
    enabled &&
    setting.value != null &&
    fixedNumber(desiredSetting.value, 1) !== fixedNumber(setting.value, 1)
  );
});

// The firmware reports no setting while the Setpoint Driver delivers nothing
const drivesNothing = computed<string | null>(() => {
  const {
    enabled,
    desiredSetting,
    setting,
    targetId,
    referenceId,
    referenceSettingOrValue,
  } = block.value.data;
  if (
    !enabled ||
    desiredSetting.value == null ||
    setting.value != null ||
    !targetId.id ||
    !referenceId.id
  ) {
    return null;
  }
  const targetBlock = sparkStore.blockByLink(serviceId, targetId);
  if (!targetBlock) {
    return `its target ${targetId.id} is gone`;
  }
  const holder = targetBlock.data.claimedBy?.id;
  if (holder && holder !== block.value.id) {
    return `its target ${targetId.id} is held by ${holder}`;
  }
  const ref = sparkStore.blockByLink(serviceId, referenceId);
  if (!ref) {
    return `its reference ${referenceId.id} is gone`;
  }
  if (referenceSettingOrValue === ReferenceKind.REF_SETTING) {
    if (ref.data.setting?.value == null) {
      return `its reference ${referenceId.id} has no setting`;
    }
  } else if (ref.data.value?.value == null) {
    return `its reference ${referenceId.id} has no measured value`;
  }
  return `its target ${targetId.id} does not take its setting`;
});

function changeEnabled(enabled: boolean): void {
  if (enabled) {
    patchBlock({ enabled });
  } else {
    createComponentDialog({
      component: ActuatorOffsetDisableDialog,
      componentProps: {
        block: block.value,
      },
    });
  }
}
</script>

<template>
  <PreviewCard :enabled="inDialog">
    <template #preview>
      <BlockHistoryGraph />
    </template>

    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <div>
      <CardWarning v-if="!target.id">
        <template #message>
          Setpoint Driver has no target Setpoint configured.
        </template>
      </CardWarning>
      <CardWarning v-else-if="!reference.id">
        <template #message>
          Setpoint Driver has no reference Setpoint configured.
        </template>
      </CardWarning>
      <CardWarning v-else-if="drivesNothing">
        <template #message>
          Setpoint Driver drives nothing: {{ drivesNothing }}.
        </template>
      </CardWarning>
      <BlockEnableToggle
        emit-toggle
        @change="changeEnabled"
      >
        <template #enabled>
          Driver is enabled and claims <i> {{ prettyLink(target) }} </i>.
          <br />
          The setting is based on the {{ refKindLabel }} of
          <i> {{ prettyLink(reference) }} </i>.
        </template>
        <template #disabled>
          Driver is disabled and does not claim
          <i> {{ prettyLink(target) }} </i>.
        </template>
      </BlockEnableToggle>

      <div class="widget-body row">
        <QuantityField
          v-model="desiredSetting"
          :backup-value="block.data.storedSetting"
          :readonly="isClaimed"
          tag="big"
          title="Desired offset"
          label="Desired offset"
          type="number"
          class="col-grow"
          tag-class="text-primary"
        />
        <QuantityField
          :model-value="block.data.setting"
          readonly
          label="Limited offset"
          tag="big"
          class="col-grow"
          :tag-class="['text-pink-4', !isLimited && 'fade-4']"
        />
        <QuantityField
          :model-value="block.data.value"
          readonly
          label="Achieved offset"
          tag="big"
          class="col-grow"
          tag-class="text-secondary"
        />

        <div class="col-break" />

        <AnalogConstraintsField
          :model-value="constraints"
          :service-id="serviceId"
          class="col-grow"
        />

        <template v-if="context.mode === 'Full'">
          <div class="col-break" />

          <LinkField
            v-model="target"
            :service-id="serviceId"
            title="Target block"
            label="Target block"
            class="col-grow"
          />
          <LinkField
            v-model="reference"
            :service-id="serviceId"
            title="Reference block"
            label="Reference block"
            class="col-grow"
          />
          <SelectField
            v-model="refKind"
            :options="referenceOpts"
            title="Reference field"
            label="Reference field"
            class="col-grow"
          />

          <div class="col-break" />

          <div class="col-break" />
          <AnalogConstraintsEditor
            v-model="constraints"
            :service-id="serviceId"
          />
        </template>
      </div>
    </div>
  </PreviewCard>
</template>
