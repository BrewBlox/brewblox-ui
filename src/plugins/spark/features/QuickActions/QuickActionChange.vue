<script lang="ts">
import difference from 'lodash/difference';
import { nanoid } from 'nanoid';
import { computed, defineComponent, PropType, reactive, ref, watch } from 'vue';

import { useBlockSpecStore, useSparkStore } from '@/plugins/spark/store';
import type { Block } from '@/plugins/spark/types';
import { BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore } from '@/store/features';
import { spliceById } from '@/utils/collections';
import { createDialog } from '@/utils/dialog';

import { BlockChange, EditableBlockField } from './types';

interface EditableBlockChange {
  id: string;
  blockId: string;
  serviceId: string;
  block: Block | null;
  spec: BlockSpec | null;
  title: string;
  fields: EditableBlockField[];
}

export default defineComponent({
  name: 'QuickActionChange',
  props: {
    modelValue: {
      type: Object as PropType<BlockChange>,
      required: true,
    },
  },
  emits: ['update:modelValue', 'remove', 'switch'],
  setup(props, { emit }) {
    const sparkStore = useSparkStore();
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const block = computed<Block | null>(() => {
      const { blockId, serviceId } = props.modelValue;
      return sparkStore.blockById(serviceId, blockId);
    });

    function makeChange(): EditableBlockChange {
      const { id, blockId, serviceId } = props.modelValue;
      const spec = specStore.blockSpecByAddress(block.value);
      const fieldSpecs = specStore.fieldSpecsByType(block.value?.type);

      const data = props.modelValue.data ?? {};
      const confirmed = props.modelValue.confirmed ?? {};

      return reactive({
        id,
        blockId,
        serviceId,
        spec,
        block: block.value,
        title: featureStore.widgetTitle(block.value?.type),
        fields:
          fieldSpecs
            .filter((f) => !f.readonly)
            .map((f) => ({
              id: f.key,
              specField: f,
              value: data[f.key] ?? null,
              confirmed: confirmed[f.key] ?? false,
            })) ?? [],
      });
    }

    const change = ref<EditableBlockChange>(makeChange());
    const rev = ref<string>('');

    watch(
      () => props.modelValue,
      () => {
        change.value = makeChange();
        rev.value = nanoid(6);
      },
    );

    const unknownValues = computed<string[]>(() => {
      const keys = Object.keys(props.modelValue.data ?? {});
      const fieldSpecs = specStore.fieldSpecsByType(block.value?.type);
      const validKeys = fieldSpecs.filter((f) => !f.readonly).map((f) => f.key);
      return difference(keys, validKeys);
    });

    function saveChange(): void {
      const data = {};
      const confirmed = {};

      change.value.fields
        .filter((field) => field.value !== null)
        .forEach((field) => {
          data[field.id] = field.value;
          confirmed[field.id] = field.confirmed;
        });

      emit('update:modelValue', {
        ...props.modelValue,
        data,
        confirmed,
      });
    }

    function saveField(field: EditableBlockField): void {
      spliceById(change.value.fields, field);
      saveChange();
    }

    function toggleField(field: EditableBlockField): void {
      field.value = field.value === null ? field.specField.generate() : null;
      saveField(field);
    }

    function editField(field: EditableBlockField): void {
      createDialog({
        component: 'BlockFieldDialog',
        componentProps: {
          modelValue: field.value,
          field: field.specField,
          address: {
            id: change.value.blockId,
            serviceId: change.value.serviceId,
          },
          title: `${change.value.blockId} ${field.specField.title}`,
        },
      }).onOk((value) => {
        field.value = value;
        saveField(field);
      });
    }

    return {
      block,
      change,
      rev,
      unknownValues,
      saveChange,
      toggleField,
      saveField,
      editField,
    };
  },
});
</script>

<template>
  <div class="depth-1 q-pa-xs q-ml-md q-gutter-sm rounded-borders">
    <div class="row q-mt-none">
      <div class="text-h6 text-secondary grabbable col-grow self-center">
        {{ change.blockId }}
        <q-tooltip>Service: {{ change.serviceId }}</q-tooltip>
      </div>
      <ActionMenu dense round>
        <template #actions>
          <ActionItem
            label="Remove block change"
            icon="delete"
            @click="$emit('remove')"
          />
          <ActionItem
            label="Switch target block"
            icon="mdi-rename-box"
            @click="$emit('switch')"
          />
        </template>
      </ActionMenu>
    </div>
    <div
      v-for="field in change.fields"
      :key="`${rev}-${field.id}`"
      class="row q-gutter-x-sm q-ml-none items-center"
    >
      <q-btn
        :icon="
          field.value === null
            ? 'mdi-checkbox-blank-outline'
            : 'mdi-checkbox-marked-outline'
        "
        flat
        dense
        class="col-auto"
        @click="toggleField(field)"
      >
        <q-tooltip>Change value when the step is applied.</q-tooltip>
      </q-btn>
      <q-btn
        :class="['col-auto', { darkened: !field.confirmed }]"
        :disable="field.value === null"
        :icon="field.value === null ? '' : 'mdi-comment-question-outline'"
        flat
        dense
        @click="
          field.confirmed = !field.confirmed;
          saveField(field);
        "
      >
        <q-tooltip>Edit value in popup when the step is applied.</q-tooltip>
      </q-btn>
      <div class="col-shrink">
        {{ field.specField.title }}
      </div>
      <div v-if="field.value !== null" class="col row justify-end q-pr-md">
        <component
          :is="field.specField.component"
          v-bind="field.specField.componentProps"
          :service-id="change.serviceId"
          :block-id="change.blockId"
          :model-value="field.value"
          @update:model-value="
            (v) => {
              field.value = v;
              saveField(field);
            }
          "
          @edit="editField(field)"
        />
      </div>
    </div>
    <q-item v-if="unknownValues.length">
      <q-item-section avatar>
        <q-icon name="warning" color="warning" />
      </q-item-section>
      <q-item-section>
        Unknown fields: {{ unknownValues.map((v) => `'${v}'`).join(', ') }}
      </q-item-section>
      <q-item-section class="col-auto">
        <q-btn flat label="Remove" @click="saveChange()" />
      </q-item-section>
    </q-item>
    <q-item v-if="!block">
      <q-item-section avatar>
        <q-icon name="warning" color="warning" />
      </q-item-section>
      <q-item-section> Block not found </q-item-section>
    </q-item>
  </div>
</template>
