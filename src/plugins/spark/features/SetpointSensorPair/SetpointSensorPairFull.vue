<script setup lang="ts">
import { Block, SetpointSensorPairBlock } from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useBlockWidget } from '@/plugins/spark/composables';
import { ENUM_LABELS_FILTER_CHOICE } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { createBlockDialog } from '@/utils/block-dialog';
import { selectable } from '@/utils/collections';

const filterOpts = selectable(ENUM_LABELS_FILTER_CHOICE);

const sparkStore = useSparkStore();
const { serviceId, blockId, block, patchBlock, isClaimed } =
  useBlockWidget.setup<SetpointSensorPairBlock>();

const usedBy = computed<Block[]>(() => {
  return sparkStore
    .blocksByService(serviceId)
    .filter((b) => b.data.inputId?.id === blockId);
});

const rampMessage = `
    <p>
      By seting a ramp limit and a ramp duration, you can limit how fast the setpoint
      can change. With the ramp limit enabled, you can make step changes to the setpoint,
      but the setpoint will not change faster than the ramp limit.
    </p>
    <p>
      For example, if the ramp limit is set to 1 °C and the ramp duration is set
      to 1 hour, the setpoint will not change faster than 1 °C per hour.
    </p>
    <p>
      This can be used to avoid shocking the yeast during fermentation.
    </p>
    `;
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body row">
      <QuantityField
        :model-value="block.data.desiredSetting"
        :backup-value="block.data.storedSetting"
        :readonly="isClaimed"
        :class="{ darkened: !block.data.enabled }"
        title="Setting"
        :label="block.data.rampLimitEnabled ? 'Desired Setting' : 'Setting'"
        tag="big"
        class="col-grow"
        @update:model-value="(v) => patchBlock({ storedSetting: v })"
      />
      <QuantityField
        v-if="block.data.rampLimitEnabled"
        :model-value="block.data.setting"
        label="Ramp limited setting"
        readonly
        tag="big"
        class="col-grow"
      />
      <QuantityField
        :model-value="block.data.value"
        label="Sensor"
        readonly
        tag="big"
        class="col-grow"
      />
      <QuantityField
        :model-value="block.data.valueUnfiltered"
        label="Unfiltered sensor"
        readonly
        tag="big"
        class="col-grow"
      />

      <div class="col-break" />

      <SelectField
        :model-value="block.data.filter"
        :options="filterOpts"
        :html="true"
        title="Filter"
        label="Filter"
        message="
              <p>
                A filter averages multiple sensor values to remove noise, spikes and sudden jumps.
              </p>
              <p>
                A slower filter will give a smoother output at the cost of a delay in response.
              </p>
              "
        class="col-grow"
        @update:model-value="(v) => patchBlock({ filter: v })"
      />
      <QuantityField
        :model-value="block.data.filterThreshold"
        :html="true"
        title="Filter reset threshold"
        label="Filter reset threshold"
        message="
              <p>
                The filter can detect when a large step occurs
                at the input. It will then reset itself to the unfiltered value to avoid a delay.
                The step detection threshold should be large enough to only trigger when you
                add hot or cold water, not when the heater or cooler turns on.
              </p>
              "
        class="col-grow"
        @update:model-value="(v) => patchBlock({ filterThreshold: v })"
      >
        <template #append>
          <q-btn
            flat
            class="self-end"
            @click.stop="patchBlock({ resetFilter: true })"
          >
            <q-tooltip>Reset filter now</q-tooltip>
            Trigger
          </q-btn>
        </template>
      </QuantityField>

      <div class="col-break" />

      <LinkField
        :model-value="block.data.sensorId"
        :service-id="serviceId"
        title="Sensor Block"
        label="Sensor Block"
        tag="span"
        class="col-grow"
        @update:model-value="(v) => patchBlock({ sensorId: v })"
      />
      <LabeledField
        label="Input for:"
        class="col-grow"
      >
        <div class="row q-gutter-xs">
          <q-btn
            v-for="userBlock in usedBy"
            :key="userBlock.id"
            :label="userBlock.id"
            dense
            no-caps
            flat
            class="depth-1"
            @click="createBlockDialog(userBlock)"
          />
          <div v-if="usedBy.length === 0">
            This setpoint is not used as PID input
          </div>
        </div>
      </LabeledField>

      <div class="col-break" />

      <ToggleButton
        :model-value="block.data.rampLimitEnabled"
        no-caps
        class="col-5"
        label="Limit how fast setpoint can ramp"
        @update:model-value="(v) => patchBlock({ rampLimitEnabled: v })"
      />
      <QuantityField
        :model-value="block.data.rampLimit"
        title="Ramp limit"
        label="Ramp limit"
        class="col-grow"
        tag="big"
        html
        :message="rampMessage"
        @update:model-value="(v) => patchBlock({ rampLimit: v })"
      />
      <span class="col-auto self-center">per</span>
      <DurationField
        v-model="block.data.rampDuration"
        title="Ramp duration"
        label="Ramp duration"
        class="col-grow"
        tag="big"
        html
        :message="rampMessage"
        @update:model-value="(v) => patchBlock({ rampDuration: v })"
      />

      <div class="col-break" />

      <ClaimIndicator
        :block-id="block.id"
        :service-id="serviceId"
        class="col-grow"
      />
    </div>
  </div>
</template>
