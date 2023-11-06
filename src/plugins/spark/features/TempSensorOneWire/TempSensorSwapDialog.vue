<script setup lang="ts">
import { UseDialogEmits, UseDialogProps, useDialog } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { BlockAddress } from '@/plugins/spark/types';
import { BlockType, TempSensorOneWireBlock } from 'brewblox-proto/ts';
import { computed, ref } from 'vue';

interface Props extends UseDialogProps {
  serviceId: string;
  leftId?: string | null;
  rightId?: string | null;
  title?: string;
  message?: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  leftId: null,
  rightId: null,
  title: 'Swap OneWire Temp Sensors',
  message: 'Pick two sensors to exchange their OneWire bus address.',
});

defineEmits<UseDialogEmits>();

const sparkStore = useSparkStore();
const { dialogRef, dialogOpts, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup<never>();

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

const leftBlock = computed<TempSensorOneWireBlock | null>(() =>
  sparkStore.blockByAddress<TempSensorOneWireBlock>(leftAddr.value),
);

const rightBlock = computed<TempSensorOneWireBlock | null>(() =>
  sparkStore.blockByAddress<TempSensorOneWireBlock>(rightAddr.value),
);

const valid = computed<boolean>(
  () =>
    leftBlock.value !== null &&
    rightBlock.value !== null &&
    leftBlock.value.id !== rightBlock.value.id,
);

function save(): void {
  if (valid.value && leftBlock.value && rightBlock.value) {
    const leftData = leftBlock.value.data;
    const rightData = rightBlock.value.data;

    const [leftAddress, rightAddress] = [leftData.address, rightData.address];
    const [leftBusId, rightBusId] = [
      leftData.oneWireBusId,
      rightData.oneWireBusId,
    ];

    sparkStore.patchBlock(leftBlock.value, {
      address: rightAddress,
      oneWireBusId: rightBusId,
    });
    sparkStore.patchBlock(rightBlock.value, {
      address: leftAddress,
      oneWireBusId: leftBusId,
    });

    onDialogOK();
  }
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{ title, message, html }">
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
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          :disable="!valid"
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
