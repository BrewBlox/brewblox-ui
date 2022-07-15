<script lang="ts">
import { PropType, computed, defineComponent, ref } from 'vue';

import { useBlockSpecStore, useSparkStore } from '@/plugins/spark/store';
import { BlockType, TempSensorMockBlock } from '@/plugins/spark/types';
import { SparkStatusDescription } from '@/plugins/spark/types';
import { makeBlockIdRules } from '@/plugins/spark/utils/configuration';
import { notify } from '@/utils/notify';
import { makeRuleValidator, suggestId } from '@/utils/rules';

export default defineComponent({
  name: 'QuickstartMockCreateField',
  props: {
    serviceId: {
      type: String,
      required: true,
    },
    names: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  setup(props) {
    const sparkStore = useSparkStore();
    const specStore = useBlockSpecStore();
    const finished = ref(false);

    const status = computed<SparkStatusDescription | null>(() =>
      sparkStore.statusByService(props.serviceId),
    );

    const isSimulation = computed<boolean>(
      () => status.value?.connection_kind === 'SIMULATION',
    );

    async function createMockSensors(): Promise<void> {
      if (!sparkStore.has(props.serviceId)) {
        return;
      }
      const validator = makeRuleValidator(makeBlockIdRules(props.serviceId));
      const spec = specStore.blockSpecByType<TempSensorMockBlock>(
        BlockType.TempSensorMock,
      );

      for (const name of props.names) {
        const block: TempSensorMockBlock = {
          id: suggestId(name, validator),
          serviceId: props.serviceId,
          type: BlockType.TempSensorMock,
          data: spec.generate(),
        };
        await sparkStore.createBlock(block);
        notify.done(`Created sensor <i>${block.id}</i>`);
      }

      finished.value = true;
    }

    return {
      finished,
      isSimulation,
      createMockSensors,
    };
  },
});
</script>

<template>
  <q-item v-if="isSimulation && !finished">
    <q-item-section>
      <div
        class="clickable rounded-borders q-pa-sm row"
        @click="createMockSensors"
      >
        <q-icon
          size="md"
          name="warning"
          color="warning"
          class="col-auto self-center q-mr-sm"
        />
        <div class="col-grow text-italic">
          '{{ serviceId }}' is a simulation service without physical sensors.
          <br />
          Click here to create Temp Sensor (Mock) blocks.
        </div>
      </div>
    </q-item-section>
  </q-item>
</template>
