<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { Block, PidBlock, SetpointSensorPairBlock } from '@/plugins/spark/types';
import { isBlockDriven } from '@/plugins/spark/utils';
import { createBlockDialog, createDialog, fixedNumber, prettyQty } from '@/utils';

export default defineComponent({
  name: 'PidBasic',
  setup() {
    const {
      sparkModule,
      blockId,
      block,
      saveBlock,
    } = useBlockWidget.setup<PidBlock>();

    const inputBlock = computed<SetpointSensorPairBlock | null>(
      () => sparkModule.blockByLink(block.value.data.inputId),
    );

    const inputDriven = computed<boolean>(
      () => isBlockDriven(inputBlock.value),
    );

    const outputBlock = computed<Block | null>(
      () => sparkModule.blockByLink(block.value.data.outputId),
    );

    const kp = computed<number | null>(
      () => block.value.data.kp.value,
    );

    function fit(v: number): number {
      return Math.min(v, 100);
    }

    function enable(): void {
      block.value.data.enabled = true;
      saveBlock();
    }

    function showInput(): void {
      createBlockDialog(inputBlock.value);
    }

    function editInput(): void {
      if (!inputBlock.value) { return; }

      const setpointId = inputBlock.value.id;

      if (sparkModule.drivenBlocks.includes(setpointId)) {
        const driveChain = sparkModule
          .drivenChains
          .find(chain => chain[0] === setpointId);

        const actual = driveChain !== undefined
          ? sparkModule.blockById(driveChain[driveChain.length - 1])
          : inputBlock.value;

        createBlockDialog(actual);
      }
      else {
        createDialog({
          component: 'SetpointSettingDialog',
          componentProps: {
            title: 'Edit Setpoint',
            message: `
            Edit settings for the PID Setpoint. <br>
            <i>${blockId}</i> and actuators will be inactive if <i>${setpointId}</i> is disabled.
            `,
            html: true,
            address: inputBlock.value,
          },
        });
      }
    }

    function showOutput(): void {
      createBlockDialog(outputBlock.value);
    }

    return {
      prettyQty,
      fixedNumber,
      block,
      saveBlock,
      inputBlock,
      inputDriven,
      outputBlock,
      kp,
      fit,
      enable,
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
      <SettingValueField editable class="col-grow" @click="editInput">
        <template #header>
          Input
        </template>
        <template #valueIcon>
          <q-icon name="mdi-thermometer" color="green-3" />
        </template>
        <template #value>
          {{ prettyQty(block.data.inputValue) }}
        </template>
        <template #setting>
          {{ prettyQty(block.data.inputSetting) }}
        </template>
      </SettingValueField>
      <SettingValueField editable class="col-grow" @click="showOutput">
        <template #header>
          Output
        </template>
        <template #valueIcon>
          <q-icon
            v-if="kp === null"
            name="mdi-calculator-variant"
          />
          <HeatingIcon
            v-else-if="kp > 0"
            color="red"
            :svg-props="{'stroke-width': '2px'}"
          />
          <CoolingIcon
            v-else-if="kp < 0"
            color="dodgerblue"
            :svg-props="{'stroke-width': '2px'}"
          />
        </template>
        <template #value>
          {{ fixedNumber(block.data.outputValue) }} %
        </template>
        <template #setting>
          {{ fixedNumber(block.data.outputSetting) }} %
        </template>
      </SettingValueField>

      <div class="col-break" />

      <div class="col row no-wrap q-gutter-x-sm q-mr-md">
        <div class="col-auto self-center text-bold">
          P
        </div>
        <q-slider
          :model-value="fit(block.data.p)"
          readonly
          class="col-grow"
          thumb-path=""
        />

        <div class="col-auto self-center text-bold">
          I
        </div>
        <q-slider
          :model-value="fit(block.data.i)"
          :max="100"
          readonly
          class="col-grow"
          thumb-path=""
        />

        <div class="col-auto self-center text-bold">
          D
        </div>
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
            `text-${block.data.boilModeActive
              ? 'deep-orange'
              : 'grey'
            }`,
          ]"
        >
          boil
        </div>
      </div>
    </div>
  </div>
</template>
