<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { BlockType, TempSensorMockBlock } from '@/plugins/spark/types';
import { SparkStatus } from '@/plugins/spark/types';
import { makeBlockIdRules } from '@/plugins/spark/utils';
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
    const finished = ref(false);

    const sparkModule = computed<SparkServiceModule | null>(
      () => sparkStore.moduleById(props.serviceId),
    );

    const status = computed<SparkStatus | null>(
      () => sparkModule.value?.status ?? null,
    );

    const isSimulation = computed<boolean>(
      () => status.value?.connectionKind === 'simulation',
    );

    async function createMockSensors(): Promise<void> {
      if (!sparkModule.value) { return; }
      const validator = makeRuleValidator(makeBlockIdRules(props.serviceId));
      const spec = sparkStore.blockSpecByType<TempSensorMockBlock>(BlockType.TempSensorMock);

      for (const name of props.names) {
        const block: TempSensorMockBlock = {
          id: suggestId(name, validator),
          serviceId: props.serviceId,
          groups: [0],
          type: BlockType.TempSensorMock,
          data: spec.generate(),
        };
        await sparkModule.value.createBlock(block);
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
          '{{ serviceId }}' is a simulation service without physical sensors. <br>
          Click here to create Temp Sensor (Mock) blocks.
        </div>
      </div>
    </q-item-section>
  </q-item>
</template>
