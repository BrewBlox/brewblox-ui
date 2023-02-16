<script lang="ts">
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { createBlockDialog } from '@/utils/block-dialog';
import { fixedNumber, prettyLink } from '@/utils/quantity';
import {
  AnalogConstraints,
  BalancedActuator,
  BalancerBlock,
  Block,
  BlockIntfType,
  Link,
} from 'brewblox-proto/ts';
import { QTableColumn } from 'quasar';
import { computed, defineComponent } from 'vue';
import { isBlockCompatible } from '../../utils/info';

interface AnalogConstrainedBlock extends Block {
  data: {
    constraints?: AnalogConstraints;
  };
}

const CLIENT_COLUMNS: QTableColumn<BalancedActuator>[] = [
  {
    name: 'id',
    label: 'Client',
    align: 'left',
    field: (row) => row.id,
    format: (v) => prettyLink(v),
    sortable: true,
  },
  {
    name: 'granted',
    label: 'Granted',
    align: 'left',
    field: (row) => row.granted,
    format: (v) => fixedNumber(v),
    sortable: true,
  },
  {
    name: 'requested',
    label: 'Requested',
    align: 'left',
    field: (row) => row.requested,
    format: (v) => fixedNumber(v),
    sortable: true,
  },
];

const COMPATIBLE_COLUMNS: QTableColumn<AnalogConstrainedBlock>[] = [
  {
    name: 'id',
    label: 'Actuator block',
    align: 'left',
    field: (row) => row.id,
    sortable: true,
  },
  {
    name: 'balancer',
    label: 'Balanced by',
    align: 'left',
    field: (row) => row.data.constraints?.balanced?.balancerId,
    format: (v) => prettyLink(v),
    sortable: true,
  },
];

export default defineComponent({
  name: 'BalancerWidget',
  setup() {
    const sparkStore = useSparkStore();
    const { context } = useContext.setup();
    const { serviceId, block } = useBlockWidget.setup<BalancerBlock>();

    const compatibleBlocks = computed<AnalogConstrainedBlock[]>(() => {
      return sparkStore
        .blocksByService(serviceId)
        .filter((v) =>
          isBlockCompatible(v, BlockIntfType.ActuatorAnalogInterface),
        );
    });

    function showBlock(target: Block | null): void {
      createBlockDialog(target);
    }

    function showBlockLink(link: Link): void {
      showBlock(sparkStore.blockByLink(serviceId, link));
    }

    return {
      prettyLink,
      fixedNumber,
      CLIENT_COLUMNS,
      COMPATIBLE_COLUMNS,
      context,
      block,
      compatibleBlocks,
      showBlock,
      showBlockLink,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <div class="column q-ma-md q-gutter-y-sm">
      <q-table
        :columns="CLIENT_COLUMNS"
        :rows="block.data.clients"
        :card-style="{ backgroundColor: 'transparent' }"
        row-key="id"
        hide-pagination
        flat
        @row-click="(_, row) => showBlockLink(row.id)"
      />
      <q-table
        v-if="context.mode === 'Full'"
        :columns="COMPATIBLE_COLUMNS"
        :rows="compatibleBlocks"
        :card-style="{ backgroundColor: 'transparent' }"
        class="q-mt-xl"
        hide-pagination
        flat
        @row-click="(_, row) => showBlock(row)"
      />
    </div>
  </Card>
</template>
