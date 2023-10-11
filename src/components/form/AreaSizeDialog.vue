<script setup lang="ts">
import { useDialog } from '@/composables';
import { PropType, ref } from 'vue';

const props = defineProps({
  ...useDialog.props,
  modelValue: {
    type: Object as PropType<AreaSize>,
    required: true,
  },
  min: {
    type: Object as PropType<AreaSize>,
    required: true,
  },
  max: {
    type: Object as PropType<AreaSize>,
    required: true,
  },
});

defineEmits({ ...useDialog.emitsObject });

const { dialogRef, dialogProps, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup();

const local = ref<AreaSize>({
  width: Number(props.modelValue.width) ?? 0,
  height: Number(props.modelValue.height) ?? 0,
});

function save(): void {
  onDialogOK(local.value);
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{ title, message, html }">
      <q-list class="q-py-lg">
        <q-item>
          <q-item-section
            label
            side
            style="min-width: 70px"
          >
            Width
          </q-item-section>
          <q-item-section>
            <q-slider
              v-model="local.width"
              :min="min.width"
              :max="max.width"
              label-always
            />
          </q-item-section>
        </q-item>
        <q-item class="q-mt-md">
          <q-item-section
            label
            side
            style="min-width: 70px"
          >
            Height
          </q-item-section>
          <q-item-section>
            <q-slider
              v-model="local.height"
              :min="min.height"
              :max="max.height"
              label-always
            />
          </q-item-section>
        </q-item>
      </q-list>
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
