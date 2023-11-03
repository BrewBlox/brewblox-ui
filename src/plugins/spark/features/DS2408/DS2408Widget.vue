<script setup lang="ts">
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { isCompatible } from '@/plugins/spark/utils/info';
import { createDialog } from '@/utils/dialog';
import { bloxLink } from '@/utils/link';
import {
  BlockIntfType,
  DigitalActuatorBlock,
  DS2408Block,
  DS2408ConnectMode,
  MotorValveBlock,
} from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

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

      if (linked.length === 0) {
        patchBlock({ connectMode: mode });
        return;
      }

      const names = linked.map((block) => `'${block.id}'`).join(', ');
      const [has, it] = linked.length > 1 ? ['have', 'them'] : ['has', 'it'];
      const message =
        `${names} ${has} this block set as output. ` +
        `Do you wish to unlink ${it}?`;

      createDialog({
        component: 'SaveConfirmDialog',
        componentProps: {
          title: 'Switch DS2408 mode',
          message,
        },
      }).onOk(async (saved: boolean) => {
        if (saved) {
          for (const actuator of linked) {
            await sparkStore.patchBlock(actuator, {
              hwDevice: bloxLink(null),
              channel: 0,
            });
          }
        }
        patchBlock({ connectMode: mode });
      });
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
