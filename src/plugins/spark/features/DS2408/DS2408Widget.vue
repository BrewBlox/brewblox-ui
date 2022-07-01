<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import {
  BlockIntfType,
  DS2408Block,
  DS2408ConnectMode,
  DigitalActuatorBlock,
  MotorValveBlock,
} from '@/plugins/spark/types';
import { isCompatible } from '@/plugins/spark/utils';
import { createDialog } from '@/utils/dialog';

import { useSparkStore } from '../../store';

const connectModeOpts: SelectOption<DS2408ConnectMode>[] = [
  { label: '2 valves', value: DS2408ConnectMode.CONNECT_VALVE },
  { label: '8 IO channels', value: DS2408ConnectMode.CONNECT_ACTUATOR },
];

export default defineComponent({
  name: 'DS2408Widget',
  setup() {
    const sparkStore = useSparkStore();
    const { context } = useContext.setup();
    const { serviceId, block, patchBlock } =
      useBlockWidget.setup<DS2408Block>();

    const valveMode = computed<boolean>(
      () => block.value.data.connectMode === DS2408ConnectMode.CONNECT_VALVE,
    );

    function setConnectMode(mode: DS2408ConnectMode): void {
      if (!mode || block.value.data.connectMode === mode) {
        return;
      }
      const linked = sparkStore
        .blocksByService(serviceId)
        .filter((b): b is DigitalActuatorBlock | MotorValveBlock =>
          isCompatible(b.type, BlockIntfType.ActuatorDigitalInterface),
        )
        .filter((b) => b.data.hwDevice.id === block.value.id);

      if (linked.length) {
        const names = linked.map((block) => `'${block.id}'`).join(', ');
        const verbs = linked.length > 1 ? ['have', 'them'] : ['has', 'it'];
        const message =
          `${names} ${verbs[0]} this block set as output. ` +
          `Do you wish to unlink ${verbs[1]}?`;
        createDialog({
          component: 'SaveConfirmDialog',
          componentProps: {
            title: 'Switch DS2408 mode',
            message,
            saveFunc: () =>
              linked.forEach((block) => {
                sparkStore.patchBlock(block, {
                  hwDevice: { ...block.data.hwDevice, id: null },
                });
              }),
          },
        }).onOk(() => {
          patchBlock({ connectMode: mode });
        });
      } else {
        patchBlock({ connectMode: mode });
      }
    }

    return {
      connectModeOpts,
      context,
      block,
      patchBlock,
      valveMode,
      setConnectMode,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <div>
      <CardWarning v-if="!block.data.connected">
        <template #message> DS2408 is not connected </template>
      </CardWarning>
      <div class="column">
        <q-btn-toggle
          :model-value="block.data.connectMode"
          :options="connectModeOpts"
          outline
          class="self-center q-my-md"
          @update:model-value="setConnectMode"
        />
      </div>
      <ValveArray v-if="valveMode" />
      <IoArray v-else />

      <template v-if="context.mode === 'Full'">
        <q-separator inset />

        <div class="widget-body row">
          <LabeledField
            :model-value="block.data.connected ? 'Yes' : 'No'"
            label="Connected"
            class="col-grow"
          />
          <InputField
            :model-value="block.data.address"
            title="Address"
            label="Address"
            class="col-grow"
            @update:model-value="(v) => patchBlock({ address: v })"
          />
        </div>
      </template>
    </div>
  </Card>
</template>
