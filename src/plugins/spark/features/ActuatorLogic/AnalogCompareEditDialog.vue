<script lang="ts">
import { Enum } from 'typescript-string-enums';
import { computed, defineComponent, PropType, ref } from 'vue';

import { useDialog } from '@/composables';
import { sparkStore } from '@/plugins/spark/store';
import { AnalogCompare, AnalogCompareOp, BlockIntfType, Quantity } from '@/plugins/spark/types';
import { isCompatible } from '@/plugins/spark/utils';
import { isQuantity } from '@/utils/identity';
import { deepCopy } from '@/utils/objects';
import { bloxQty, tempQty } from '@/utils/quantity';

import { analogOpTitles } from './getters';

const operatorOpts = Enum.values(AnalogCompareOp)
  .map(value => ({ value, label: analogOpTitles[value] }));

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
    const local = ref<AnalogCompare>(deepCopy(props.modelValue));
    const sparkModule = sparkStore.moduleById(props.serviceId)!;

    const isTemp = computed<boolean>(
      () => {
        const block = sparkModule.blockById(local.value.id.id);
        return !!block && isCompatible(block.type, BlockIntfType.SetpointSensorPairInterface);
      },
    );

    const rhs = computed<Quantity | number>({
      get: () => {
        const cmp = local.value;
        return isTemp.value
          ? tempQty(cmp.rhs)
          : cmp.rhs;
      },
      set: v => {
        local.value.rhs = isQuantity(v)
          ? bloxQty(v).to('degC').value ?? 0
          : v;
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
      rhs,
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
          v-if="isTemp"
          v-model="rhs"
          label="Target value"
          class="col"
        />
        <InputField
          v-else
          v-model="rhs"
          type="number"
          label="Target value"
          class="col"
        />
      </div>
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
