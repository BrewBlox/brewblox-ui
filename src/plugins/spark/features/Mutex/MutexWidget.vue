<script setup lang="ts">
import {
  Block,
  BlockIntfType,
  DigitalConstraints,
  MutexBlock,
  MutexedConstraint,
  Quantity,
} from 'brewblox-proto/ts';
import { QTableColumn } from 'quasar';
import { computed } from 'vue';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { isBlockCompatible } from '@/plugins/spark/utils/info';
import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';
import { prettyLink, prettyQty } from '@/utils/quantity';

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
    format: (v) => (v?.enabled ? prettyLink(v?.mutexId) : ''),
    sortable: true,
  },
];

const sparkStore = useSparkStore();
const { context } = useContext.setup();
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

const nonClientBlocks = computed<DigitalConstrainedBlock[]>(() =>
  compatibleBlocks.value.filter((b) => {
    const mutexed: MutexedConstraint | undefined = b.data.constraints?.mutexed;
    return !mutexed?.enabled || mutexed?.mutexId.id !== block.value.id;
  }),
);

function showBlockById(id: string): void {
  createBlockDialog({ serviceId, id, type: null });
}

function showHelpDialog(): void {
  createDialog({
    component: 'ConfirmDialog',
    componentProps: {
      title: 'Mutex block',
      html: true,
      cancel: false,
      message: `
          <p>
            Mutex is short for
            <b>Mut</b>ually <b>Ex</b>clusive.
          </p>
          <p>
            If you add a Mutex constraint to multiple digital actuators, they
            will never be active at the same time if they share the same Mutex
            block.
          </p>
          <p>This can be used to:</p>
          <ul>
            <li>Prevent heating and cooling at the same time.</li>
            <li>
              Prevent two or more heating elements from exceeding your maximum
              available power.
            </li>
          </ul>
          <p>
            The Mutex can also prevent switching between two actuators too
            quickly.<br />
            If you set the extra lock time in a Mutex constraint to 45 minutes,
            a heater can only turn on after the cooler has been inactive for 45
            minutes.
          </p>
          <p>
            Usage of the Mutex and Balancer blocks is described in the
            <a
              href="https://www.brewblox.com/user/control_chains.html#when-you-only-have-power-for-1-element-sharing-power-over-multiple-elements"
              target="_blank"
              style="color: white"
            >
              control chains guide
            </a>.
          </p>
          `,
    },
  });
}
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <div class="widget-body column">
      <q-table
        :columns="CLIENT_COLUMNS"
        :rows="mutexClients"
        :card-style="{ backgroundColor: 'transparent' }"
        row-key="id"
        hide-pagination
        flat
        @row-click="(_, row) => showBlockById(row.id)"
      />
      <q-btn
        class="self-end"
        outline
        round
        label="?"
        @click="showHelpDialog"
      />
    </div>

    <template v-if="context.mode === 'Full'">
      <div class="widget-body">
        <q-table
          title="Compatible blocks"
          :columns="COMPATIBLE_COLUMNS"
          :rows="nonClientBlocks"
          :card-style="{ backgroundColor: 'transparent' }"
          hide-pagination
          flat
          @row-click="(_, row) => showBlockById(row.id)"
        />
      </div>
    </template>
  </Card>
</template>
