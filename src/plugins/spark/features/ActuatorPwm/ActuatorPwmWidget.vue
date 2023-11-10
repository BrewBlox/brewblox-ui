<script setup lang="ts">
import { ActuatorPwmBlock, Link } from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { PWM_SELECT_OPTIONS } from '@/plugins/spark/const';
import { fixedNumber, prettyLink, roundedNumber } from '@/utils/quantity';

const { context, inDialog } = useContext.setup();

const { serviceId, block, patchBlock, isClaimed } =
  useBlockWidget.setup<ActuatorPwmBlock>();

const outputLink = computed<Link>(() => block.value.data.actuatorId);

const isLimited = computed<boolean>(
  () =>
    block.value.data.enabled &&
    block.value.data.setting !== block.value.data.desiredSetting,
);

const pwmDesired = computed<number | null>(() => {
  const v = block.value.data.desiredSetting;
  return v ? roundedNumber(v, 0) : v;
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
        <template #message> PWM has no target actuator configured. </template>
      </CardWarning>
      <BlockEnableToggle>
        <template #enabled>
          PWM is enabled and claims <i> {{ prettyLink(outputLink) }} </i>.
        </template>
        <template #disabled>
          PWM is disabled and does not claim
          <i> {{ prettyLink(outputLink) }} </i>.
        </template>
      </BlockEnableToggle>

      <div class="widget-body row">
        <div
          v-if="!isClaimed"
          class="col-grow row q-mb-sm justify-around q-gutter-xs"
        >
          <div
            v-for="q in PWM_SELECT_OPTIONS"
            :key="'quick' + q.value"
            class="col-auto clickable rounded-borders"
          >
            <q-btn
              :label="q.label"
              unelevated
              @click="patchBlock({ storedSetting: q.value })"
            />
          </div>
        </div>

        <div class="col-break" />

        <q-slider
          v-if="!isClaimed"
          :model-value="pwmDesired"
          class="col-grow q-mt-md q-mx-md'"
          label-always
          color="primary"
          @change="(v) => patchBlock({ storedSetting: v })"
        />
        <div
          v-else
          class="col-grow text-center text-italic fade-3"
        >
          This PWM is claimed by a PID block. <br />
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

        <ClaimIndicator
          :block-id="block.id"
          :service-id="serviceId"
          class="col-grow"
        />

        <AnalogConstraintsField
          :model-value="block.data.constraints"
          :service-id="serviceId"
          class="col-grow"
          @update:model-value="(v) => patchBlock({ constraints: v })"
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
            @update:model-value="(v) => patchBlock({ period: v })"
          />
          <LinkField
            :model-value="block.data.actuatorId"
            :service-id="serviceId"
            title="target"
            label="Digital Actuator Target"
            class="col-grow"
            @update:model-value="(v) => patchBlock({ actuatorId: v })"
          />
          <div class="col-break" />
          <AnalogConstraintsEditor
            :service-id="serviceId"
            :model-value="block.data.constraints"
            @update:model-value="(v) => patchBlock({ constraints: v })"
          />
        </div>
      </template>
    </div>
  </PreviewCard>
</template>
