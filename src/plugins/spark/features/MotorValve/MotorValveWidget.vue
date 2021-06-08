<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { BlockType, MotorValveBlock, Spark3PinsBlock } from '@/plugins/spark/types';
import { makeTypeFilter } from '@/utils';

import MotorValveBasic from './MotorValveBasic.vue';
import MotorValveFull from './MotorValveFull.vue';

export default defineComponent({
  name: 'MotorValveWidget',
  components: {
    Basic: MotorValveBasic,
    Full: MotorValveFull,
  },
  setup() {
    const {
      context,
      inDialog,
    } = useContext.setup();
    const {
      sparkModule,
      block,
    } = useBlockWidget.setup<MotorValveBlock>();

    // Spark 2 pins have no support for toggling 12V
    const spark3Pins = computed<Spark3PinsBlock | null>(
      () => sparkModule
        .blocks
        .find(makeTypeFilter<Spark3PinsBlock>(BlockType.Spark3Pins))
        ?? null,
    );

    const disabled12V = computed<boolean>(
      () => spark3Pins.value?.data.enableIoSupply12V === false,
    );

    function enable12V(): void {
      if (spark3Pins.value) {
        spark3Pins.value.data.enableIoSupply12V = true;
        sparkModule.saveBlock(spark3Pins.value);
      }
    }

    return {
      inDialog,
      context,
      block,
      disabled12V,
      enable12V,
    };
  },
});
</script>

<template>
  <PreviewCard :enabled="inDialog">
    <template #preview>
      <BlockHistoryGraph />
    </template>

    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <component :is="context.mode">
      <template #warnings>
        <CardWarning v-if="disabled12V">
          <template #message>
            <span>12V is disabled.</span>
          </template>
          <template #actions>
            <q-btn text-color="white" flat label="Enable 12V" @click="enable12V" />
          </template>
        </CardWarning>
        <CardWarning v-else-if="!block.data.hwDevice.id || !block.data.startChannel">
          <template #message>
            <span>This Motor Valve has no channel selected.</span>
          </template>
        </CardWarning>
      </template>
    </component>
  </PreviewCard>
</template>
