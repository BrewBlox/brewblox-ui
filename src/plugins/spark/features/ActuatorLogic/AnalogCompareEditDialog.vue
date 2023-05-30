<script lang="ts">
import { useDialog } from '@/composables';
import { ENUM_LABELS_ANALOG_OP } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { isBlockCompatible } from '@/plugins/spark/utils/info';
import { selectable } from '@/utils/collections';
import { bloxQty, tempQty } from '@/utils/quantity';
import { AnalogCompare, BlockType, Quantity } from 'brewblox-proto/ts';
import cloneDeep from 'lodash/cloneDeep';
import { computed, defineComponent, PropType, ref } from 'vue';

const operatorOpts = selectable(ENUM_LABELS_ANALOG_OP);

export default defineComponent({
  name: 'AnalogCompareEdit',
  props: {
    ...useDialog.props,
    modelValue: {
      type: Object as PropType<AnalogCompare>,
      required: true,
    },
    serviceId: {
      type: String,
      required: true,
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const sparkStore = useSparkStore();
    const { dialogRef, dialogProps, onDialogHide, onDialogOK, onDialogCancel } =
      useDialog.setup();
    const local = ref<AnalogCompare>(cloneDeep(props.modelValue));

    const isTemp = computed<boolean>(() =>
      isBlockCompatible(
        sparkStore.blockById(props.serviceId, local.value.id.id),
        [BlockType.SetpointSensorPair, BlockType.ActuatorOffset],
      ),
    );

    const rhsQty = computed<Quantity | null>({
      get: () => (isTemp.value ? tempQty(local.value.rhs) : null),
      set: (v) => {
        if (v == null) {
          local.value.rhs = 0;
        } else {
          local.value.rhs = bloxQty(v).to('degC').value ?? 0;
        }
      },
    });

    const rhsNumber = computed<number | null>({
      get: () => (isTemp.value ? null : local.value.rhs),
      set: (v) => {
        local.value.rhs = v ?? 0;
      },
    });

    function save(): void {
      onDialogOK(local.value);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      operatorOpts,
      local,
      isTemp,
      rhsQty,
      rhsNumber,
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
    <DialogCard v-bind="{ title, message, html }">
      <LinkField
        v-model="local.id"
        :service-id="serviceId"
        title="target"
        label="Analog input"
      />
      <div class="row justify-between q-mt-sm q-pl-sm q-gutter-sm">
        <q-select
          v-model="local.op"
          :options="operatorOpts"
          map-options
          emit-value
          label="Operator"
          class="col"
          @keyup.enter.exact.stop
        />
        <QuantityField
          v-if="rhsQty != null"
          v-model="rhsQty"
          label="Target value"
          class="col"
        />
        <InputField
          v-else-if="rhsNumber != null"
          v-model="rhsNumber"
          type="number"
          label="Target value"
          class="col"
        />
      </div>
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
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
