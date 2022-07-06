<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { ActuatorOffsetBlock, ReferenceKind } from '@/plugins/spark/types';
import { AnalogConstraintsObj, Link } from '@/shared-types';
import { fixedNumber, prettyLink } from '@/utils/quantity';

const referenceOpts: SelectOption<ReferenceKind>[] = [
  { label: 'Setting', value: ReferenceKind.REF_SETTING },
  { label: 'Measured', value: ReferenceKind.REF_VALUE },
];

export default defineComponent({
  name: 'ActuatorOffsetWidget',
  setup() {
    const { context, inDialog } = useContext.setup();
    const { serviceId, block, patchBlock, isDriven } =
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
      () =>
        referenceOpts.find((v) => v.value === refKind.value)?.label ?? '???',
    );

    const desiredSetting = computed<number>({
      get: () => block.value.data.desiredSetting,
      set: (v) => patchBlock({ desiredSetting: v }),
    });

    const constrainedBy = computed<AnalogConstraintsObj>({
      get: () => block.value.data.constrainedBy,
      set: (v) => patchBlock({ constrainedBy: v }),
    });

    const isLimited = computed<boolean>(() => {
      const { enabled, desiredSetting, setting } = block.value.data;
      return (
        enabled && fixedNumber(desiredSetting, 1) !== fixedNumber(setting, 1)
      );
    });

    return {
      prettyLink,
      referenceOpts,
      context,
      inDialog,
      serviceId,
      block,
      isDriven,
      target,
      reference,
      refKind,
      refKindLabel,
      desiredSetting,
      constrainedBy,
      isLimited,
    };
  },
});
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
      <BlockEnableToggle :hide-enabled="context.mode === 'Basic'">
        <template #enabled>
          Driver is enabled and driving <i> {{ prettyLink(target) }} </i>, based
          on the {{ refKindLabel }} of <i> {{ prettyLink(reference) }} </i>.
        </template>
        <template #disabled>
          Driver is disabled and not driving <i> {{ prettyLink(target) }} </i>.
        </template>
      </BlockEnableToggle>

      <div class="widget-body row">
        <InputField
          v-model="desiredSetting"
          :readonly="isDriven"
          tag="big"
          title="Desired offset"
          label="Desired offset"
          type="number"
          class="col-grow"
          tag-class="text-primary"
        />
        <LabeledField
          :model-value="block.data.setting"
          number
          label="Limited offset"
          tag="big"
          class="col-grow"
          :tag-class="['text-pink-4', !isLimited && 'fade-4']"
        />
        <LabeledField
          :model-value="block.data.value"
          number
          label="Achieved offset"
          tag="big"
          class="col-grow"
          tag-class="text-secondary"
        />

        <template v-if="context.mode === 'Full'">
          <div class="col-break" />

          <LinkField
            v-model="target"
            :service-id="serviceId"
            title="Driven block"
            label="Driven block"
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
        </template>

        <div class="col-break" />

        <DrivenIndicator
          :block-id="block.id"
          :service-id="serviceId"
          class="col-grow"
        />
        <ConstraintsField
          v-model="constrainedBy"
          :service-id="serviceId"
          type="analog"
          class="col-grow"
        />
      </div>
    </div>
  </PreviewCard>
</template>
