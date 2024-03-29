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
import { createComponentDialog } from '@/utils/dialog';
import { fixedNumber, prettyLink } from '@/utils/quantity';
import ActuatorOffsetDisableDialog from './ActuatorOffsetDisableDialog.vue';

const referenceOpts: SelectOption<ReferenceKind>[] = [
  { label: 'Setting', value: ReferenceKind.REF_SETTING },
  { label: 'Measured', value: ReferenceKind.REF_VALUE },
];

const { context, inDialog } = useContext.setup();
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
    fixedNumber(desiredSetting.value, 1) !== fixedNumber(setting.value, 1)
  );
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

        <ClaimIndicator
          :block-id="block.id"
          :service-id="serviceId"
          class="col-grow"
        />
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
