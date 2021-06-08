<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import { useDialog } from '@/composables';
import { sparkStore } from '@/plugins/spark/store';
import { calculateProfileValues } from '@/plugins/spark/utils';
import { Quantity, SetpointProfileBlock, SetpointSensorPairBlock } from '@/shared-types';
import { createDialog, deepCopy, prettyUnit, roundedQty, tempQty } from '@/utils';


export default defineComponent({
  name: 'SetpointProfileDisableDialog',
  props: {
    ...useDialog.props,
    block: {
      type: Object as PropType<SetpointProfileBlock>,
      required: true,
    },
    title: {
      type: String,
      default: 'Desired Setpoint settings',
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
    const profile: SetpointProfileBlock = deepCopy(props.block);
    const setpoint: SetpointSensorPairBlock | null =
      sparkStore.blockByLink(profile.serviceId, profile.data.targetId);

    if (!setpoint) {
      profile.data.enabled = false;
      sparkStore.saveBlock(profile);
      onDialogOK();
    }

    const profileValue = calculateProfileValues(profile);

    const setpointId = setpoint?.id ?? 'Unknown';
    const setpointEnabled = ref<boolean>(true);
    const setpointSetting = ref<Quantity>(
      roundedQty(
        profileValue?.current
        ?? setpoint?.data.storedSetting
        ?? tempQty(20),
      ),
    );

    function showKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: setpointSetting.value.value,
          suffix: setpointSetting.value.unit,
          type: 'number',
        },
      })
        .onOk(v => setpointSetting.value.value = v);
    }

    function confirm(): void {
      if (setpoint) {
        sparkStore.modifyBlock(setpoint, block => {
          block.data.settingEnabled = setpointEnabled.value;
          block.data.storedSetting = setpointSetting.value;
        });
      }
      sparkStore.modifyBlock(profile, block => block.data.enabled = false);
      onDialogOK();
    }

    return {
      prettyUnit,
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      setpointId,
      setpointEnabled,
      setpointSetting,
      showKeyboard,
      confirm,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="confirm"
  >
    <DialogCard v-bind="{title, message, html}">
      <template #title>
        Desired Setpoint settings
      </template>
      <template #message>
        Your Setpoint Profile will now stop driving the Setpoint. <br>
        <br>
        Please confirm the new settings for <i>{{ setpointId }}</i>.
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
        pattern="[0-9]*"
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
