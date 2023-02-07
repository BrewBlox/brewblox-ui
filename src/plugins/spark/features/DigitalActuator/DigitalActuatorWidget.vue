<script lang="ts">
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { ENUM_LABELS_TRANSITION_PRESET } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { setExclusiveChannelActuator } from '@/plugins/spark/utils/configuration';
import { channelName } from '@/plugins/spark/utils/formatting';
import { selectable } from '@/utils/collections';
import { makeTypeFilter } from '@/utils/functional';
import { matchesType } from '@/utils/objects';
import { prettyQty } from '@/utils/quantity';
import {
  Block,
  BlockType,
  ChannelCapabilities,
  DigitalActuatorBlock,
  DS2408Block,
  DS2408ConnectMode,
  IoArrayInterfaceBlock,
  TransitionDurationPreset,
} from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

interface Claim {
  driverId: string;
  channelId: number;
}

function targetFilter(b: Block): boolean {
  // Special exception for DS2408 targets
  // They are only compatible in actuator mode
  if (matchesType<DS2408Block>(BlockType.DS2408, b)) {
    return b.data.connectMode === DS2408ConnectMode.CONNECT_ACTUATOR;
  }
  // Filter is in addition to the default compatibility check
  return true;
}

const actuatorFilter = makeTypeFilter<DigitalActuatorBlock>(
  BlockType.DigitalActuator,
);

const transitionPresetOpts = selectable(ENUM_LABELS_TRANSITION_PRESET);

export default defineComponent({
  name: 'DigitalActuatorWidget',
  setup() {
    const sparkStore = useSparkStore();
    const { inDialog, context } = useContext.setup();
    const { serviceId, block, patchBlock, isClaimed, limitations } =
      useBlockWidget.setup<DigitalActuatorBlock>();

    const hwBlock = computed<IoArrayInterfaceBlock | null>(() =>
      sparkStore.blockById(serviceId, block.value.data.hwDevice.id),
    );

    const softStartSupported = computed<boolean>(() => {
      const channel = hwBlock.value?.data.channels.find(
        (c) => c.id === block.value.data.channel,
      );
      return (
        channel != null &&
        Boolean(
          channel.capabilities & ChannelCapabilities.CHAN_SUPPORTS_PWM_100HZ,
        )
      );
    });

    const claims = computed<Claim[]>(() => {
      if (!hwBlock.value) {
        return [];
      }
      const targetId = hwBlock.value.id;
      return sparkStore
        .blocksByService(serviceId)
        .filter(actuatorFilter)
        .filter((b) => b.id !== block.value.id)
        .filter((b) => b.data.hwDevice.id === targetId)
        .map((b) => ({ driverId: b.id, channelId: b.data.channel }));
    });

    const channelOpts = computed<SelectOption<number>[]>(() => {
      if (!hwBlock.value) {
        return [{ value: 0, label: 'Not set' }];
      }
      const targetBlock = hwBlock.value;
      return [
        { value: 0, label: 'Not set' },
        ...targetBlock.data.channels.map((channel) => {
          const claim = claims.value.find((c) => c.channelId === channel.id);
          const name = channelName(targetBlock, channel.id) ?? 'Unknown';
          const desc = claim ? `${name} (replace ${claim.driverId})` : name;
          return { value: channel.id, label: desc };
        }),
      ];
    });

    async function claimChannel(channelId: number): Promise<void> {
      if (block.value.data.channel === channelId) {
        return;
      }
      const claim = claims.value.find((c) => c.channelId === channelId);
      if (claim) {
        const driver = sparkStore.blockById<DigitalActuatorBlock>(
          serviceId,
          claim.driverId,
        )!;
        await sparkStore.patchBlock(driver, { channel: 0 });
      }
      await patchBlock({ channel: channelId });
    }

    return {
      prettyQty,
      TransitionDurationPreset,
      setExclusiveChannelActuator,
      transitionPresetOpts,
      ChannelCapabilities,
      inDialog,
      context,
      serviceId,
      block,
      patchBlock,
      softStartSupported,
      isClaimed,
      limitations,
      channelOpts,
      claimChannel,
      targetFilter,
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
      <CardWarning v-if="!block.data.hwDevice.id || !block.data.channel">
        <template #message>
          <span>Digital Actuator has no channel selected.</span>
        </template>
      </CardWarning>

      <div class="widget-body row">
        <LabeledField
          class="col"
          tag-class="full-width row justify-center"
        >
          <DigitalStateButton
            :model-value="block.data.desiredState"
            :pending="block.data.state !== block.data.desiredState"
            :pending-reason="limitations"
            :disable="isClaimed"
            class="col-auto"
            @update:model-value="(v) => patchBlock({ storedState: v })"
          />
        </LabeledField>

        <template v-if="context.mode === 'Full'">
          <div class="col-break" />

          <ChannelSelectField
            :model-value="{
              hwDevice: block.data.hwDevice,
              channel: block.data.channel,
            }"
            :service-id="serviceId"
            :capabilities="ChannelCapabilities.CHAN_SUPPORTS_DIGITAL_OUTPUT"
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

          <template v-if="softStartSupported">
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
          </template>
          <template v-else>
            <LabeledField
              label="Soft start"
              class="col-grow"
            >
              Soft start is not supported on target channel
            </LabeledField>
          </template>
        </template>

        <div class="col-break" />

        <ClaimIndicator
          :block-id="block.id"
          :service-id="serviceId"
          class="col-grow"
        />
        <DigitalConstraintsField
          :model-value="block.data.constraints"
          :service-id="serviceId"
          class="col-grow"
          @update:model-value="(v) => patchBlock({ constraints: v })"
        />
      </div>
    </div>
  </PreviewCard>
</template>
