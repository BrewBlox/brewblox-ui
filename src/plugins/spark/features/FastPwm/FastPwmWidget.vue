<script lang="ts">
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import {
  ENUM_LABELS_PWM_FREQUENCY,
  ENUM_LABELS_TRANSITION_PRESET,
  PWM_SELECT_OPTIONS,
} from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { setExclusiveChannelActuator } from '@/plugins/spark/utils/configuration';
import { channelName, prettyBlock } from '@/plugins/spark/utils/formatting';
import { selectable } from '@/utils/collections';
import {
  fixedNumber,
  prettyLink,
  prettyQty,
  roundedNumber,
} from '@/utils/quantity';
import {
  ChannelCapabilities,
  FastPwmBlock,
  IoArrayInterfaceBlock,
  TransitionDurationPreset,
} from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

const frequencyOpts = selectable(ENUM_LABELS_PWM_FREQUENCY);
const transitionPresetOpts = selectable(ENUM_LABELS_TRANSITION_PRESET);

export default defineComponent({
  name: 'FastPwmWidget',
  setup() {
    const sparkStore = useSparkStore();
    const { context, inDialog } = useContext.setup();

    const { serviceId, block, patchBlock, isClaimed } =
      useBlockWidget.setup<FastPwmBlock>();

    const target = computed<IoArrayInterfaceBlock | null>(() =>
      sparkStore.blockByLink(serviceId, block.value.data.hwDevice),
    );

    const isLimited = computed<boolean>(
      () =>
        block.value.data.enabled &&
        block.value.data.setting !== block.value.data.desiredSetting,
    );

    const pwmDesired = computed<number | null>(() => {
      const v = block.value.data.desiredSetting;
      return v ? roundedNumber(v, 0) : v;
    });

    return {
      prettyQty,
      TransitionDurationPreset,
      transitionPresetOpts,
      setExclusiveChannelActuator,
      ChannelCapabilities,
      prettyLink,
      fixedNumber,
      frequencyOpts,
      PWM_SELECT_OPTIONS,
      context,
      inDialog,
      serviceId,
      block,
      target,
      patchBlock,
      isClaimed,
      isLimited,
      pwmDesired,
      channelName,
      prettyBlock,
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
      <CardWarning v-if="!target || !block.data.channel">
        <template #message> PWM has no target channel configured. </template>
      </CardWarning>
      <BlockEnableToggle>
        <template #enabled>
          PWM is enabled
          <template v-if="target">
            and claims
            <i>
              {{ prettyBlock(target) }}
              {{ channelName(target, block.data.channel) }} </i
            >.
          </template>
        </template>
        <template #disabled>
          PWM is disabled
          <template v-if="target">
            and does not claim
            <i>
              {{ prettyBlock(target) }}
              {{ channelName(target, block.data.channel) }} </i
            >.
          </template>
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
        />
      </div>

      <template v-if="context.mode === 'Full'">
        <q-separator inset />

        <div class="widget-body row">
          <SelectField
            :model-value="block.data.frequency"
            :options="frequencyOpts"
            title="Frequency"
            label="Frequency"
            class="col-grow"
            @update:model-value="(v) => patchBlock({ frequency: v })"
          />
          <ChannelSelectField
            :model-value="{
              hwDevice: block.data.hwDevice,
              channel: block.data.channel,
            }"
            :service-id="serviceId"
            :capabilities="ChannelCapabilities.CHAN_SUPPORTS_PWM_100HZ"
            clearable
            title="Target channel"
            label="Channel"
            class="col-grow"
            @update:model-value="
              ({ hwDevice, channel }) =>
                setExclusiveChannelActuator(block, hwDevice, channel)
            "
          />
          <LabeledField
            label="Invert"
            class="col-grow"
          >
            <q-toggle
              :model-value="block.data.invert"
              dense
              @update:model-value="(v) => patchBlock({ invert: v })"
            />
          </LabeledField>

          <div class="col-break" />

          <SelectField
            :model-value="block.data.transitionDurationPreset"
            :options="transitionPresetOpts"
            title="Soft start preset"
            label="Soft start preset"
            class="col-grow"
            @update:model-value="
              (v) => patchBlock({ transitionDurationPreset: v })
            "
          />
          <DurationField
            v-if="
              block.data.transitionDurationPreset ===
              TransitionDurationPreset.ST_CUSTOM
            "
            :model-value="block.data.transitionDurationSetting"
            title="Custom soft start duration"
            label="Soft start"
            class="col-grow"
            @update:model-value="
              (v) => patchBlock({ transitionDurationSetting: v })
            "
          />
          <LabeledField
            v-else
            label="Soft start"
            class="col-grow"
          >
            {{ prettyQty(block.data.transitionDurationValue) }}
          </LabeledField>

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
