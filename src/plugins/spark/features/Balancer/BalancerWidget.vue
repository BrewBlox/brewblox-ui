<script lang="ts">
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';
import { fixedNumber, prettyLink } from '@/utils/quantity';
import {
  AnalogConstraints,
  BalancedActuator,
  BalancedConstraint,
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
    field: (row) => row.data.constraints?.balanced,
    format: (v) => (v?.enabled ? prettyLink(v?.balancerId) : ''),
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

    const nonClientBlocks = computed<AnalogConstrainedBlock[]>(() =>
      compatibleBlocks.value.filter((b) => {
        const balanced: BalancedConstraint | undefined =
          b.data.constraints?.balanced;
        return !balanced?.enabled || balanced?.balancerId.id !== block.value.id;
      }),
    );

    function showBlock(target: Block | null): void {
      createBlockDialog(target);
    }

    function showBlockLink(link: Link): void {
      showBlock(sparkStore.blockByLink(serviceId, link));
    }

    function showHelpDialog(): void {
      createDialog({
        component: 'ConfirmDialog',
        componentProps: {
          title: 'Balancer block',
          html: true,
          cancel: false,
          message: `
          <p>
            When two actuators need to share a total available amount,
            the balancer can ensure it is shared fairly.
          </p>
          <p>
            The most common example is using two heating elements
            with a <i>Mutex</i> constraint.
            The sum of their settings should be limited to 100%.
          </p>
          <p>
            When a Balanced constraint is set on multiple PWM blocks,
            they ask their target Balancer how much they can use.
            The Balancer scales down their setting proportionally
            so the sum does not exceed 100%.
            Without the balancer, a heater with PWM at 100%
            would never release the mutex to give the other heater some time.
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

    return {
      prettyLink,
      fixedNumber,
      CLIENT_COLUMNS,
      COMPATIBLE_COLUMNS,
      context,
      block,
      nonClientBlocks,
      showBlock,
      showBlockLink,
      showHelpDialog,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <div class="widget-body column">
      <q-table
        :columns="CLIENT_COLUMNS"
        :rows="block.data.clients"
        :card-style="{ backgroundColor: 'transparent' }"
        row-key="id"
        hide-pagination
        flat
        @row-click="(_, row) => showBlockLink(row.id)"
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
          @row-click="(_, row) => showBlock(row)"
        />
      </div>
    </template>
  </Card>
</template>
