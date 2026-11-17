<script setup lang="ts">
import {
  BlockType,
  Fluctuation,
  TempSensorMockBlock,
  TempSensorMockFluctuatingBlock,
} from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { createDialog } from '@/utils/dialog';
import { bloxQty, deltaTempQty, prettyQty } from '@/utils/quantity';

// The widget of both mock sensors: only the fluctuating one has fluctuations
const { context, inDialog } = useContext.setup();
const { block, patchBlock } = useBlockWidget.setup<
  TempSensorMockBlock | TempSensorMockFluctuatingBlock
>();

const fluctuations = computed<Fluctuation[] | null>(() =>
  block.value.type === BlockType.TempSensorMockFluctuating
    ? block.value.data.fluctuations
    : null,
);

function addFluctuation(): void {
  patchBlock({
    fluctuations: [
      ...(fluctuations.value ?? []),
      {
        amplitude: deltaTempQty(1),
        period: bloxQty('6h'),
      },
    ],
  });
}

function updateFluctuation(idx: number, fluct: Fluctuation): void {
  const updated = [...(fluctuations.value ?? [])];
  updated[idx] = fluct;
  patchBlock({ fluctuations: updated });
}

function removeFluctuation(idx: number): void {
  patchBlock({
    fluctuations: (fluctuations.value ?? []).filter((_, i) => i !== idx),
  });
}

function editSetting(): void {
  createDialog({
    component: 'QuantityDialog',
    componentProps: {
      modelValue: block.value.data.setting,
      title: 'Setting',
      label: 'Setting',
    },
  }).onOk((v) => {
    patchBlock({ setting: v });
  });
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

    <div class="widget-body">
      <div class="row justify-around">
        <SettingValueField
          :class="['col-auto', !block.data.connected && 'darkish']"
          editable
          @click="editSetting"
        >
          <template #valueIcon>
            <SensorSvgIcon
              x="0"
              y="0"
              width="30"
              height="30"
            />
          </template>
          <template #value>
            {{ prettyQty(block.data.value) }}
          </template>
          <template #settingIcon>
            <SetpointSvgIcon
              x="0"
              y="0"
              width="30"
              height="30"
            />
          </template>
          <template #setting>
            {{ prettyQty(block.data.setting) }}
          </template>
        </SettingValueField>
      </div>

      <template v-if="context.mode === 'Full'">
        <q-separator inset />
        <LabeledField
          label="Connected"
          class="col-auto min-width-sm"
        >
          <q-toggle
            dense
            :model-value="block.data.connected"
            class="q-pl-md"
            @update:model-value="(v) => patchBlock({ connected: v })"
          />
        </LabeledField>
        <template v-if="fluctuations">
          <div class="text-h6 text-italic q-pl-sm">Fluctuations</div>
          <p
            v-if="fluctuations.length === 0"
            class="text-italic q-pl-sm"
          >
            Add value fluctuations to simulate periodic temperature changes. A
            fluctuation with period 0 is a constant offset.
          </p>
          <div
            v-for="(fluct, idx) in fluctuations"
            :key="`fluct-${idx}`"
            class="row q-gutter-x-sm q-ml-none fluctuation"
          >
            <QuantityField
              :model-value="fluct.amplitude"
              title="Amplitude"
              label="Amplitude"
              class="col-grow"
              @update:model-value="
                (amplitude) => updateFluctuation(idx, { ...fluct, amplitude })
              "
            />
            <DurationField
              :model-value="fluct.period"
              title="Period"
              label="Period"
              class="col-grow"
              @update:model-value="
                (period) => updateFluctuation(idx, { ...fluct, period })
              "
            />
            <q-btn
              flat
              round
              icon="delete"
              class="col-auto self-center"
              @click="removeFluctuation(idx)"
            />
          </div>
          <div class="row justify-end q-pr-md">
            <q-btn
              fab-mini
              icon="add"
              color="indigo-4"
              class="self-center"
              @click="addFluctuation"
            >
              <q-tooltip>Add fluctuation</q-tooltip>
            </q-btn>
          </div>
        </template>
      </template>
    </div>
  </PreviewCard>
</template>

<style lang="sass" scoped>
.fluctuation:nth-child(even) > label
  background: rgba($green-5, 0.05)

.fluctuation:nth-child(odd) > label
  background: rgba($blue-5, 0.05)
</style>
