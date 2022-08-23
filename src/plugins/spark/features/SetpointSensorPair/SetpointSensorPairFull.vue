<script lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { ENUM_LABELS_FILTER_CHOICE } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { createBlockDialog } from '@/utils/block-dialog';
import { selectable } from '@/utils/collections';
import { Block, SetpointSensorPairBlock } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

const filterOpts = selectable(ENUM_LABELS_FILTER_CHOICE);

export default defineComponent({
  name: 'SetpointSensorPairFull',
  setup() {
    const sparkStore = useSparkStore();
    const {
      serviceId,
      blockId,
      block,
      patchBlock,
      isVolatileBlock,
      isClaimed,
    } = useBlockWidget.setup<SetpointSensorPairBlock>();

    const usedBy = computed<Block[]>(() => {
      if (isVolatileBlock.value) {
        return [];
      }
      return sparkStore
        .blocksByService(serviceId)
        .filter((b) => b.data.inputId?.id === blockId);
    });

    return {
      createBlockDialog,
      filterOpts,
      serviceId,
      block,
      patchBlock,
      isClaimed,
      usedBy,
    };
  },
});
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body row">
      <QuantityField
        :model-value="block.data.storedSetting"
        :readonly="isClaimed"
        :class="{ darkened: !block.data.enabled }"
        title="Setting"
        label="Setting"
        tag="big"
        class="col-grow"
        @update:model-value="(v) => patchBlock({ storedSetting: v })"
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
        label="Filter period"
        message="
              <p>
                A filter averages multiple sensor values to remove noise, spikes and sudden jumps.
                Changes faster than the filter period will be filtered out.
              </p>
              <p>
                A longer period will give a smoother output at the cost of a delay in response.
                This delay is equal to the chosen period.
              </p>
              "
        class="col-grow"
        @update:model-value="(v) => patchBlock({ filter: v })"
      />
      <QuantityField
        :model-value="block.data.filterThreshold"
        :html="true"
        title="Filter bypass threshold"
        label="Bypass threshold"
        message="
              <p>
                The filter can detect when a large step occurs
                at the input and temporary bypass slow filtering.
                The threshold for an input change that should trigger this can be set here.
              </p>
              "
        class="col-grow"
        @update:model-value="(v) => patchBlock({ filterThreshold: v })"
      >
        <template #append>
          <q-btn
            flat
            round
            icon="mdi-skip-forward"
            class="self-end"
            @click.stop="patchBlock({ resetFilter: true })"
          >
            <q-tooltip>Bypass filter now</q-tooltip>
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

      <ClaimIndicator
        :block-id="block.id"
        :service-id="serviceId"
        class="col-grow"
      />
    </div>

    <q-card-section v-if="false">
      <q-separator inset />

      <q-item class="items-start">
        <q-item-section class="col-4" />
        <q-item-section v-if="usedBy.length" />
      </q-item>

      <q-item class="items-end">
        <q-item-section class="col-4" />
        <q-item-section class="col-3" />
        <q-item-section class="col-4" />
      </q-item>

      <q-item>
        <q-item-section class="col-4" />
        <q-item-section class="col-7" />
      </q-item>

      <q-item>
        <q-item-section />
      </q-item>
    </q-card-section>
  </div>
</template>
