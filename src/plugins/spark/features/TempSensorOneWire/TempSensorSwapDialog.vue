<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

import { useDialog } from '@/composables';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockType, TempSensorOneWireBlock } from '@/plugins/spark/types';

export default defineComponent({
  name: 'TempSensorSwapDialog',
  props: {
    ...useDialog.props,
    serviceId: {
      type: String,
      required: true,
    },
    leftId: {
      type: String,
      default: null,
    },
    rightId: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: 'Swap OneWire Temp Sensors',
    },
    message: {
      type: String,
      default: 'Pick two sensors to exchange their OneWire bus address.',
    },
  },
  emits: [
    ...useDialog.emits,
  ],
  setup(props) {
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogOK,
      onDialogCancel,
    } = useDialog.setup();

    const leftAddr = ref<BlockAddress>({
      id: props.leftId,
      type: BlockType.TempSensorOneWire,
      serviceId: props.serviceId,
    });
    const rightAddr = ref<BlockAddress>({
      id: props.rightId,
      type: BlockType.TempSensorOneWire,
      serviceId: props.serviceId,
    });

    const sparkModule = computed<SparkServiceModule>(
      () => sparkStore.moduleById(props.serviceId)!,
    );

    const leftBlock = computed<TempSensorOneWireBlock | null>(
      () => sparkModule.value.blockByAddress<TempSensorOneWireBlock>(leftAddr.value),
    );

    const rightBlock = computed<TempSensorOneWireBlock | null>(
      () => sparkModule.value.blockByAddress<TempSensorOneWireBlock>(rightAddr.value),
    );

    const valid = computed<boolean>(
      () => leftBlock.value !== null
        && rightBlock.value !== null
        && leftBlock.value.id !== rightBlock.value.id,
    );

    function save(): void {
      if (valid.value && leftBlock.value && rightBlock.value) {
        const left = leftBlock.value.data.address;
        const right = rightBlock.value.data.address;
        leftBlock.value.data.address = right;
        rightBlock.value.data.address = left;
        sparkModule.value.saveBlock(leftBlock.value);
        sparkModule.value.saveBlock(rightBlock.value);
        onDialogOK();
      }
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      leftAddr,
      rightAddr,
      valid,
      save,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <BlockAddressField
        v-model="leftAddr"
        label="Sensor A"
        title="Choose sensor A"
      />
      <BlockAddressField
        v-model="rightAddr"
        label="Sensor B"
        title="Choose sensor B"
      />
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn :disable="!valid" flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
