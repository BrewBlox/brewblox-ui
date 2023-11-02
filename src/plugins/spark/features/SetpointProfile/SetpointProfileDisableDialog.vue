<script setup lang="ts">
import { useDialog } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { calculateProfileValues } from '@/plugins/spark/utils/configuration';
import { createDialog } from '@/utils/dialog';
import { bloxQty, prettyUnit, tempQty } from '@/utils/quantity';
import {
  Quantity,
  SetpointProfileBlock,
  SetpointSensorPairBlock,
  SettingMode,
} from 'brewblox-proto/ts';
import cloneDeep from 'lodash/cloneDeep';
import { PropType, ref } from 'vue';

const props = defineProps({
  ...useDialog.props,
  block: {
    type: Object as PropType<SetpointProfileBlock>,
    required: true,
  },
  title: {
    type: String,
    default: 'Desired Setpoint settings',
  },
});

defineEmits<UseDialogEmits>();

const sparkStore = useSparkStore();
const { dialogRef, dialogOpts, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup();
const profile: SetpointProfileBlock = cloneDeep(props.block);
const setpoint: SetpointSensorPairBlock | null = sparkStore.blockByLink(
  profile.serviceId,
  profile.data.targetId,
);

if (!setpoint) {
  sparkStore.patchBlock(profile, { enabled: false });
  onDialogOK();
}

const profileValue = calculateProfileValues(profile);

const setpointId = setpoint?.id ?? 'Unknown';
const setpointEnabled = ref<boolean>(true);
const setpointSetting = ref<Quantity>(
  bloxQty(
    profileValue?.current ?? setpoint?.data.storedSetting ?? tempQty(20),
  ).round(),
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
  await sparkStore.patchBlock(profile, {
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
        Your Setpoint Profile will now release its claim on
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
