<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import { useDialog } from '@/composables';
import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress } from '@/plugins/spark/types';
import { ifCompatible } from '@/plugins/spark/utils';
import { BlockType, Quantity, SetpointSensorPairBlock } from '@/shared-types';
import { createDialog } from '@/utils/dialog';
import { prettyUnit } from '@/utils/formatting';
import { tempQty } from '@/utils/quantity';


export default defineComponent({
  name: 'SetpointSettingDialog',
  props: {
    ...useDialog.props,
    address: {
      type: Object as PropType<BlockAddress>,
      required: true,
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

    const block = ifCompatible<SetpointSensorPairBlock>(
      sparkStore.blockByAddress(props.address),
      BlockType.SetpointSensorPair,
    );

    const enabled = ref<boolean>(block?.data.settingEnabled ?? false);
    const setting = ref<Quantity>(block?.data.storedSetting ?? tempQty(null));

    const notation = prettyUnit(setting.value.unit);

    const isValid = computed<boolean>(
      () => block !== null && setting.value.value !== null,
    );

    function showKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: setting.value.value,
          type: 'number',
          suffix: notation,
        },
      })
        .onOk(v => setting.value.value = v);
    }

    function save(): void {
      if (block) {
        sparkStore.modifyBlock(block, actual => {
          actual.data.settingEnabled = enabled.value;
          actual.data.storedSetting = setting.value;
        });
        onDialogOK();
      }
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      enabled,
      setting,
      notation,
      isValid,
      showKeyboard,
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
      <div
        class="
        row items-center
        q-gutter-x-md q-mx-md q-py-sm q-mt-sm
        clickable rounded-borders
        "
        @click="enabled = !enabled"
      >
        <q-icon
          :name="enabled ? 'mdi-link' : 'mdi-link-variant-off'"
          :color="enabled ? 'positive' : 'negative'"
          size="md"
          class="col-auto"
        />
        <div class="col">
          <small class="col fade-5">Click to toggle</small>
          <div v-show="enabled" class="col">
            <slot name="enabled">
              Setpoint is enabled.
            </slot>
          </div>
          <div v-show="!enabled" class="col">
            <slot name="disabled">
              Setpoint is disabled.
            </slot>
          </div>
        </div>
      </div>

      <q-input
        v-model.number="setting.value"
        label="Setting"
        :suffix="notation"
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
          :disable="!isValid"
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
