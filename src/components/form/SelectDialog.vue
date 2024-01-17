<script setup lang="ts">
import { ref } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';

interface Props extends UseDialogProps {
  modelValue: any;
  selectOptions: any[];
  selectProps?: AnyDict;
  listSelect?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  selectProps: () => ({}),
  listSelect: false,
});

defineEmits<UseDialogEmits>();

const { dialogOpts, dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup();

const local = ref<any>(props.modelValue);

function save(value: any): void {
  if (value !== null || props.selectProps.clearable) {
    onDialogOK(value);
  }
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    @hide="onDialogHide"
    @keyup.enter="save(local)"
  >
    <DialogCard v-bind="{ title, message, html }">
      <ListSelect
        v-if="listSelect"
        v-model="local"
        :options="selectOptions"
        emit-value
        option-value="value"
        option-label="label"
        v-bind="selectProps"
        @confirm="(v) => save(v)"
      />
      <q-select
        v-else
        v-model="local"
        :options="selectOptions"
        item-aligned
        emit-value
        map-options
        v-bind="selectProps"
        @keyup.enter.exact.stop
      >
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey"> No results </q-item-section>
          </q-item>
        </template>
      </q-select>
      <template #actions>
        <q-btn
          color="primary"
          flat
          label="Cancel"
          @click="onDialogCancel"
        />
        <q-btn
          :disable="!selectProps.clearable && local === null"
          color="primary"
          flat
          label="OK"
          @click="save(local)"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
