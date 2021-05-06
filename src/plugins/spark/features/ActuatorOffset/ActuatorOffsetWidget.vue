<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { ActuatorOffsetBlock, ReferenceKind } from '@/plugins/spark/types';
import { Link, prettyLink } from '@/utils/bloxfield';
import { round } from '@/utils/functional';

const referenceOpts: SelectOption<ReferenceKind>[] = [
  { label: 'Setting', value: ReferenceKind.REF_SETTING },
  { label: 'Measured', value: ReferenceKind.REF_VALUE },
];

export default defineComponent({
  name: 'ActuatorOffsetWidget',
  setup() {
    const {
      context,
      inDialog,
    } = useContext.setup();
    const {
      serviceId,
      block,
      saveBlock,
      isDriven,
    } = useBlockWidget.setup<ActuatorOffsetBlock>();

    function enable(): void {
      block.value.data.enabled = true;
      saveBlock();
    }

    const target = computed<Link>(
      () => block.value.data.targetId,
    );

    const reference = computed<Link>(
      () => block.value.data.referenceId,
    );

    const refKind = computed<string>(
      () => referenceOpts
        .find(v => v.value === block.value.data.referenceSettingOrValue)
        ?.label
        ?? '???',
    );

    const isLimited = computed<boolean>(
      () => {
        const { enabled, desiredSetting, setting } = block.value.data;
        return enabled
          && round(desiredSetting, 1) !== round(setting, 1);
      },
    );

    return {
      prettyLink,
      referenceOpts,
      context,
      inDialog,
      serviceId,
      block,
      saveBlock,
      isDriven,
      enable,
      target,
      reference,
      refKind,
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

    <div class="widget-md">
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
        :hide-enabled="context.mode === 'Basic'"
      >
        <template #enabled>
          Driver is enabled and driving <i>{{ prettyLink(target) }}</i>, based on the
          {{ refKind }} of <i>{{ prettyLink(reference) }}</i>.
        </template>
        <template #disabled>
          Driver is disabled and not driving <i>{{ prettyLink(target) }}</i>.
        </template>
      </BlockEnableToggle>

      <div class="widget-body row">
        <InputField
          :readonly="isDriven"
          :model-value="block.data.desiredSetting"
          tag="big"
          title="Desired offset"
          label="Desired offset"
          type="number"
          class="col-grow"
          tag-class="text-primary"
          @update:model-value="v => { block.data.desiredSetting = v; saveBlock(); }"
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
            :model-value="block.data.targetId"
            :service-id="serviceId"
            title="Driven block"
            label="Driven block"
            class="col-grow"
            @update:model-value="v => { block.data.targetId = v; saveBlock(); }"
          />
          <LinkField
            :model-value="block.data.referenceId"
            :service-id="serviceId"
            title="Reference block"
            label="Reference block"
            class="col-grow"
            @update:model-value="v => { block.data.referenceId = v; saveBlock(); }"
          />
          <SelectField
            :model-value="block.data.referenceSettingOrValue"
            :options="referenceOpts"
            title="Reference field"
            label="Reference field"
            class="col-grow"
            @update:model-value="v => { block.data.referenceSettingOrValue = v; saveBlock(); }"
          />
        </template>

        <div class="col-break" />

        <DrivenIndicator
          :block-id="block.id"
          :service-id="serviceId"
          class="col-grow"
        />
        <ConstraintsField
          :model-value="block.data.constrainedBy"
          :service-id="serviceId"
          type="analog"
          class="col-grow"
          @update:model-value="v => { block.data.constrainedBy = v; saveBlock(); }"
        />
      </div>
    </div>
  </PreviewCard>
</template>
