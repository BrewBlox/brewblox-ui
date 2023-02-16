<script lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { createBlockDialog } from '@/utils/block-dialog';
import { durationString, prettyLink, prettyQty } from '@/utils/quantity';
import {
  Block,
  BlockIntfType,
  DigitalConstraints,
  MutexBlock,
  MutexedConstraint,
  Quantity,
} from 'brewblox-proto/ts';
import { QTableColumn } from 'quasar';
import { computed, defineComponent } from 'vue';
import { isBlockCompatible } from '../../utils/info';

interface DigitalConstrainedBlock extends Block {
  data: {
    constraints?: DigitalConstraints;
  };
}

interface MutexClient {
  id: string;
  constraint: MutexedConstraint;
  remaining?: Quantity;
}

const CLIENT_COLUMNS: QTableColumn<MutexClient>[] = [
  {
    name: 'id',
    label: 'Client',
    align: 'left',
    field: (row) => row.id,
    sortable: true,
  },
  {
    name: 'holdTime',
    label: 'Extra hold time',
    align: 'left',
    field: (row) => row.constraint.extraHoldTime,
    format: (v) => prettyQty(v),
    sortable: true,
  },
  {
    name: 'locked',
    label: 'Has lock',
    align: 'left',
    field: (row) => row.constraint.hasLock,
    format: (v, row) => {
      if (!v) {
        return '';
      }
      if (row.remaining?.value) {
        return `Yes (${prettyQty(row.remaining)})`;
      }
      return 'Yes';
    },
    sortable: true,
  },
];

const COMPATIBLE_COLUMNS: QTableColumn<DigitalConstrainedBlock>[] = [
  {
    name: 'id',
    label: 'Actuator block',
    align: 'left',
    field: (row) => row.id,
    sortable: true,
  },
  {
    name: 'balancer',
    label: 'Mutexed by',
    align: 'left',
    field: (row) => row.data.constraints?.mutexed,
    format: (v) => {
      if (v?.enabled) {
        return prettyLink(v?.mutexId);
      }
      return '';
    },
    sortable: true,
  },
];

export default defineComponent({
  name: 'MutexBasic',
  setup() {
    const sparkStore = useSparkStore();
    const { serviceId, block } = useBlockWidget.setup<MutexBlock>();

    const compatibleBlocks = computed<DigitalConstrainedBlock[]>(() =>
      sparkStore
        .blocksByService(serviceId)
        .filter((b) =>
          isBlockCompatible(b, BlockIntfType.ActuatorDigitalInterface),
        ),
    );

    const mutexClients = computed<MutexClient[]>(() =>
      compatibleBlocks.value
        .filter((b) => {
          const mutexed: MutexedConstraint | undefined =
            b.data.constraints?.mutexed;
          return mutexed?.enabled && mutexed?.mutexId.id === block.value.id;
        })
        .map((b) => ({
          id: b.id,
          constraint: b.data.constraints!.mutexed!,
          remaining: b.data.constraints?.mutexed?.hasLock
            ? block.value.data.waitRemaining
            : undefined,
        })),
    );

    function showBlockById(id: string): void {
      createBlockDialog({ serviceId, id, type: null });
    }

    return {
      durationString,
      CLIENT_COLUMNS,
      COMPATIBLE_COLUMNS,
      block,
      mutexClients,
      compatibleBlocks,
      showBlockById,
    };
  },
});
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body">
      <q-table
        :columns="CLIENT_COLUMNS"
        :rows="mutexClients"
        :card-style="{ backgroundColor: 'transparent' }"
        row-key="id"
        hide-pagination
        flat
        @row-click="(_, row) => showBlockById(row.id)"
      />
      <q-table
        :columns="COMPATIBLE_COLUMNS"
        :rows="compatibleBlocks"
        :card-style="{ backgroundColor: 'transparent' }"
        class="q-mt-xl"
        hide-pagination
        flat
        @row-click="(_, row) => showBlockById(row.id)"
      />
      <!-- <LabeledField
        label="Clients"
        class="col-grow"
      >
        <div
          v-for="{ id, limiting, hasLock } in mutexClients"
          :key="id"
          :class="[
            'q-px-sm q-py-xs',
            limiting && 'text-orange',
            hasLock && 'text-green',
          ]"
        >
          <q-icon
            v-if="hasLock"
            name="mdi-lock"
          />
          <q-icon
            v-else
            name=""
          />
          {{ id }}
        </div>
      </LabeledField>
      <LabeledField
        label="Lock time remaining"
        class="col-grow"
      >
        {{ durationString(block.data.waitRemaining) }}
      </LabeledField> -->
    </div>
  </div>
</template>
