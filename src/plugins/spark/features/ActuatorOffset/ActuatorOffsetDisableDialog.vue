<script setup lang="ts">
import {
  ActuatorOffsetBlock,
  Quantity,
  SetpointSensorPairBlock,
  SettingMode,
} from 'brewblox-proto/ts';
import cloneDeep from 'lodash/cloneDeep';
import { ref } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { createDialog } from '@/utils/dialog';
import { bloxQty, prettyUnit, tempQty } from '@/utils/quantity';

interface Props extends UseDialogProps {
  block: ActuatorOffsetBlock;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  title: 'Desired Setpoint settings',
});

defineEmits<UseDialogEmits>();

const sparkStore = useSparkStore();
const { dialogRef, dialogOpts, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup<never>();
const driver: ActuatorOffsetBlock = cloneDeep(props.block);
const setpoint: SetpointSensorPairBlock | null = sparkStore.blockByLink(
  driver.serviceId,
  driver.data.targetId,
);

if (!setpoint) {
  sparkStore.patchBlock(driver, { enabled: false });
  onDialogOK();
}

const setpointId = setpoint?.id ?? 'Unknown';
const setpointEnabled = ref<boolean>(true);
const setpointSetting = ref<Quantity>(
  bloxQty(setpoint?.data.storedSetting ?? tempQty(20)).round(),
);

function showKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: setpointSetting.value.value,
      suffix: setpointSetting.value.unit,
      type: 'number',
    },
  }).onOk((v) => (setpointSetting.value.value = v));
}

async function confirm(): Promise<void> {
  await sparkStore.patchBlock(driver, {
    enabled: false,
  });
  await sparkStore.patchBlock(setpoint, {
    enabled: setpointEnabled.value,
    storedSetting: setpointSetting.value,
    settingMode: SettingMode.STORED,
  });
  onDialogOK();
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    @hide="onDialogHide"
    @keyup.enter="confirm"
  >
    <DialogCard v-bind="{ title, message, html }">
      <template #title> Desired Setpoint settings </template>
      <template #message>
        Your Setpoint Driver will now release its claim on
        <i> {{ setpointId }} </i>.
        <br />
        <br />
        Please confirm the new settings for <i> {{ setpointId }} </i>.
      </template>

      <q-toggle
        v-model="setpointEnabled"
        label="Setpoint enabled"
        class="q-mx-sm"
      />
      <q-input
        v-model.number="setpointSetting.value"
        label="Setpoint setting"
        :suffix="prettyUnit(setpointSetting.unit)"
        input-class="text-big"
        inputmode="numeric"
        pattern="[0-9\.]*"
        autofocus
        clearable
        item-aligned
      >
        <template #append>
          <KeyboardButton @click="showKeyboard" />
        </template>
      </q-input>

      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          label="OK"
          color="primary"
          @click="confirm"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
