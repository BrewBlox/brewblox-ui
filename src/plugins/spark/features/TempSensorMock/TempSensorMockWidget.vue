<script lang="ts">
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { createDialog } from '@/utils/dialog';
import { bloxQty, deltaTempQty, prettyQty } from '@/utils/quantity';
import { Fluctuation, TempSensorMockBlock } from 'brewblox-proto/ts';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TempSensorMockWidget',
  setup() {
    const { context, inDialog } = useContext.setup();
    const { block, patchBlock } = useBlockWidget.setup<TempSensorMockBlock>();

    function addFluctuation(): void {
      patchBlock({
        fluctuations: [
          ...block.value.data.fluctuations,
          {
            amplitude: deltaTempQty(1),
            period: bloxQty('6h'),
          },
        ],
      });
    }

    function updateFluctuation(idx: number, fluct: Fluctuation): void {
      patchBlock({
        fluctuations: [...block.value.data.fluctuations].splice(idx, 1, fluct),
      });
    }

    function removeFluctuation(idx: number): void {
      patchBlock({
        fluctuations: [...block.value.data.fluctuations].splice(idx, 1),
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

    return {
      prettyQty,
      context,
      inDialog,
      block,
      patchBlock,
      addFluctuation,
      updateFluctuation,
      removeFluctuation,
      editSetting,
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

    <div class="widget-body">
      <div class="row justify-around">
        <SettingValueField
          :class="['col-auto', !block.data.connected && 'darkish']"
          editable
          @click="editSetting"
        >
          <template #valueIcon>
            <q-icon
              name="mdi-thermometer"
              color="green-3"
            />
          </template>
          <template #value>
            {{ prettyQty(block.data.value) }}
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
        <div class="text-h6 text-italic q-pl-sm">Fluctuations</div>
        <p
          v-if="block.data.fluctuations.length === 0"
          class="text-italic q-pl-sm"
        >
          Add value fluctuations to simulate periodic temperature changes.
        </p>
        <div
          v-for="(fluct, idx) in block.data.fluctuations"
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
    </div>
  </PreviewCard>
</template>

<style
  lang="sass"
  scoped
>
.fluctuation:nth-child(even) > label
  background: rgba($green-5, 0.05)

.fluctuation:nth-child(odd) > label
  background: rgba($blue-5, 0.05)
</style>
