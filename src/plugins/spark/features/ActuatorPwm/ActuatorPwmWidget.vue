<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { ActuatorPwmBlock } from '@/plugins/spark/types';
import { Link } from '@/shared-types';
import { prettyLink } from '@/utils/bloxfield';
import { fixedNumber, roundNumber } from '@/utils/formatting';

const quickValues: SelectOption<number>[] = [
  { label: '0%', value: 0 },
  { label: '25%', value: 25 },
  { label: '50%', value: 50 },
  { label: '75%', value: 75 },
  { label: '100%', value: 100 },
];

export default defineComponent({
  name: 'ActuatorPwmWidget',
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
    } = useBlockWidget.setup<ActuatorPwmBlock>();

    const outputLink = computed<Link>(
      () => block.value.data.actuatorId,
    );

    const isLimited = computed<boolean>(
      () => block.value.data.enabled
        && block.value.data.setting !== block.value.data.desiredSetting,
    );

    function updateSetting(value: number): void {
      block.value.data.desiredSetting = value;
      saveBlock();
    }

    const pwmDesired = computed<number | null>(
      () => {
        const v = block.value.data.desiredSetting;
        return v
          ? roundNumber(v, 0)
          : v;
      },
    );

    return {
      prettyLink,
      fixedNumber,
      quickValues,
      context,
      inDialog,
      serviceId,
      block,
      saveBlock,
      isDriven,
      outputLink,
      isLimited,
      updateSetting,
      pwmDesired,
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

    <div class="q-mx-auto">
      <CardWarning v-if="!outputLink.id">
        <template #message>
          PWM has no target actuator configured.
        </template>
      </CardWarning>
      <BlockEnableToggle
        :hide-enabled="context.mode === 'Basic'"
      >
        <template #enabled>
          PWM is enabled and driving <i>{{ prettyLink(outputLink) }}</i>.
        </template>
        <template #disabled>
          PWM is disabled and not driving <i>{{ prettyLink(outputLink) }}</i>.
        </template>
      </BlockEnableToggle>

      <div class="widget-body row">
        <div
          v-if="!isDriven"
          class="col-grow row q-mb-sm justify-around q-gutter-xs"
        >
          <div
            v-for="q in quickValues"
            :key="'quick'+q.value"
            class="col-auto clickable rounded-borders"
          >
            <q-btn
              :label="q.label"
              unelevated
              @click="updateSetting(q.value)"
            />
          </div>
        </div>

        <div class="col-break" />

        <q-slider
          v-if="!isDriven"
          :model-value="pwmDesired"
          class="col-grow q-mt-md q-mx-md'"
          label-always
          color="primary"
          @change="updateSetting"
        />
        <div v-else class="col-grow text-center text-italic fade-3">
          This PWM is driven by a PID block. <br>
          Manual settings are disabled.
        </div>

        <div class="col-break" />

        <div class="col-grow row justify-around text-h6 text-bold">
          <div class="col-auto text-primary">
            Desired: {{ fixedNumber(block.data.desiredSetting, 0) }}%
          </div>
          <div :class="['col-auto text-pink-4', !isLimited && 'fade-4']">
            Limited: {{ fixedNumber(block.data.setting, 0) }}%
          </div>
          <div class="col-auto text-secondary">
            Achieved: {{ fixedNumber(block.data.value, 0) }}%
          </div>
        </div>

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

      <template v-if="context.mode === 'Full'">
        <q-separator inset />

        <div class="widget-body row">
          <DurationField
            :model-value="block.data.period"
            title="Period"
            label="Period"
            tag="big"
            class="col-grow"
            @update:model-value="v => { block.data.period = v; saveBlock(); }"
          />
          <LinkField
            :model-value="block.data.actuatorId"
            :service-id="serviceId"
            title="target"
            label="Digital Actuator Target"
            class="col-grow"
            @update:model-value="v => { block.data.actuatorId = v; saveBlock(); }"
          />
        </div>
      </template>
    </div>
  </PreviewCard>
</template>
