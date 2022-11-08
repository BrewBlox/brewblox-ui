<script lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';
import { fixedNumber, prettyQty } from '@/utils/quantity';
import { Block, PidBlock, SetpointSensorPairBlock } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'PidBasic',
  setup() {
    const sparkStore = useSparkStore();
    const { serviceId, blockId, block } = useBlockWidget.setup<PidBlock>();

    const inputBlock = computed<SetpointSensorPairBlock | null>(() =>
      sparkStore.blockByLink(serviceId, block.value.data.inputId),
    );

    const outputBlock = computed<Block | null>(() =>
      sparkStore.blockByLink(serviceId, block.value.data.outputId),
    );

    const kp = computed<number | null>(() => block.value.data.kp.value);

    function fit(v: number): number {
      return Math.min(v, 100);
    }

    function showInput(): void {
      createBlockDialog(inputBlock.value);
    }

    function editInput(): void {
      if (!inputBlock.value) {
        return;
      }

      const setpointId = inputBlock.value.id;
      const setpointClaimedById = inputBlock.value.data.claimedBy.id;
      let message = `Edit settings for the <i>${setpointId}</i> Setpoint.`;

      if (setpointClaimedById) {
        message += `<br> <i>${setpointId}</i> is claimed by <i>${setpointClaimedById}</i>.
        The setting will be overridden until the claiming block is disabled.`;
      }

      createDialog({
        component: 'SetpointSettingDialog',
        componentProps: {
          title: 'Edit Setpoint',
          message,
          html: true,
          address: inputBlock.value,
        },
      });
    }

    function showOutput(): void {
      createBlockDialog(outputBlock.value);
    }

    return {
      prettyQty,
      fixedNumber,
      block,
      inputBlock,
      outputBlock,
      kp,
      fit,
      showInput,
      editInput,
      showOutput,
    };
  },
});
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body row justify-center">
      <SettingValueField
        editable
        class="col-grow"
        @click="editInput"
      >
        <template #header> Input </template>
        <template #valueIcon>
          <SensorSvgIcon
            x="0"
            y="0"
            width="30"
            height="30"
          />
        </template>
        <template #value>
          {{ prettyQty(block.data.inputValue) }}
        </template>
        <template #settingIcon>
          <SetpointSvgIcon
            x="0"
            y="0"
            width="30"
            height="30"
          />
        </template>
        <template #setting>
          {{ prettyQty(block.data.inputSetting) }}
        </template>
      </SettingValueField>
      <SettingValueField
        editable
        class="col-grow"
        @click="showOutput"
      >
        <template #header> Output </template>
        <template #valueIcon>
          <CoolingSvgIcon
            v-if="kp && kp < 0"
            x="0"
            y="0"
            width="30"
            height="30"
            stroke="dodgerblue"
          />
          <HeatingSvgIcon
            v-else
            x="0"
            y="0"
            width="30"
            height="30"
            fill="red"
          />
        </template>
        <template #value>
          {{ fixedNumber(block.data.outputValue) }} %
        </template>
        <template #settingIcon>
          <SetpointSvgIcon
            x="0"
            y="0"
            width="30"
            height="30"
          />
        </template>
        <template #setting>
          {{ fixedNumber(block.data.outputSetting) }} %
        </template>
      </SettingValueField>

      <div class="col-break" />

      <div class="col row no-wrap q-gutter-x-sm q-mr-md">
        <div class="col-auto self-center text-bold">P</div>
        <q-slider
          :model-value="fit(block.data.p)"
          readonly
          class="col-grow"
          thumb-path=""
        />

        <div class="col-auto self-center text-bold">I</div>
        <q-slider
          :model-value="fit(block.data.i)"
          :max="100"
          readonly
          class="col-grow"
          thumb-path=""
        />

        <div class="col-auto self-center text-bold">D</div>
        <q-slider
          :model-value="fit(block.data.d)"
          :max="100"
          readonly
          class="col-grow"
          thumb-path=""
        />

        <div
          v-if="!!block.data.boilMinOutput"
          :class="[
            'col-auto self-center text-bold',
            `text-${block.data.boilModeActive ? 'deep-orange' : 'grey'}`,
          ]"
        >
          boil
        </div>
      </div>
    </div>
  </div>
</template>
