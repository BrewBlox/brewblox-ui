<script lang="ts">
import difference from 'lodash/difference';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { spliceById } from '@/helpers/functional';
import { sparkStore } from '@/plugins/spark/store';
import type { Block } from '@/plugins/spark/types';
import { BlockSpec } from '@/plugins/spark/types';
import { featureStore } from '@/store/features';

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

@Component
export default class QuickActionChange extends Vue {
  editable = false;

  @Prop({ type: Object, required: true })
  public readonly value!: BlockChange;

  get change(): EditableBlockChange {
    const { id, blockId, serviceId } = this.value;
    const block = sparkStore.blockById(serviceId, blockId);
    const spec = block !== null
      ? sparkStore.spec(block) ?? null
      : null;

    const data = this.value.data ?? {};
    const confirmed = this.value.confirmed ?? {};

    return {
      id,
      blockId,
      serviceId,
      block,
      spec,
      title: block ? featureStore.widgetTitle(block.type) : 'Unknown',
      fields: spec?.fields
        .filter(f => !f.readonly)
        .map(f => ({
          id: f.key,
          specField: f,
          value: data[f.key] ?? null,
          confirmed: confirmed[f.key] ?? false,
        }))
        ?? [],
    };
  }

  get unknownValues(): string[] {
    const { spec } = this.change;
    if (spec === null) {
      return [];
    }
    const keys = Object.keys(this.value.data ?? {});
    const validKeys = spec
      .fields
      .filter(f => !f.readonly)
      .map(f => f.key);
    return difference(keys, validKeys);
  }

  saveChange(change: EditableBlockChange = this.change): void {
    const data = {};
    const confirmed = {};

    change.fields
      .filter(field => field.value !== null)
      .forEach(field => {
        data[field.id] = field.value;
        confirmed[field.id] = field.confirmed;
      });

    this.$set(this.value, 'data', data);
    this.$set(this.value, 'confirmed', confirmed);
    this.$emit('input', this.value);
  }

  saveField(field: EditableBlockField): void {
    spliceById(this.change.fields, field);
    this.saveChange();
  }

  toggleField(field: EditableBlockField): void {
    field.value = field.value === null
      ? field.specField.generate(this.change.serviceId)
      : null;
    this.saveField(field);
  }

  editField(field: EditableBlockField): void {
    createDialog({
      component: 'ChangeFieldDialog',
      field: field.specField,
      address: {
        id: this.change.blockId,
        serviceId: this.change.serviceId,
      },
      value: field.value,
      title: `${this.change.blockId} ${field.specField.title}`,
    })
      .onOk(value => this.saveField({ ...field, value }));
  }
}
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
      :key="field.id"
      class="row q-gutter-x-sm q-ml-none items-center"
    >
      <q-btn
        :icon="field.value === null
          ? 'mdi-checkbox-blank-outline'
          : 'mdi-checkbox-marked-outline'"
        flat
        dense
        class="col-auto"
        @click="toggleField(field)"
      >
        <q-tooltip>Change value when the step is applied.</q-tooltip>
      </q-btn>
      <q-btn
        :class="['col-auto', {darkened: !field.confirmed}]"
        :disable="field.value === null"
        :icon="field.value === null
          ? ''
          : 'mdi-comment-question-outline'"
        flat
        dense
        @click="field.confirmed = !field.confirmed; saveField(field)"
      >
        <q-tooltip>Edit value in popup when the step is applied.</q-tooltip>
      </q-btn>
      <div class="col-shrink">
        {{ field.specField.title }}
      </div>
      <div
        v-if="field.value !== null"
        class="col row justify-end q-pr-md"
      >
        <component
          :is="field.specField.component"
          v-bind="field.specField.componentProps"
          :service-id="change.serviceId"
          :block-id="change.blockId"
          :value="field.value"
          @input="v => { field.value = v; saveField(field)}"
          @edit="editField(field)"
        />
      </div>
    </div>
    <q-item v-if="unknownValues.length">
      <q-item-section avatar>
        <q-icon name="warning" color="warning" />
      </q-item-section>
      <q-item-section>
        Unknown fields: {{ unknownValues.map(v => `'${v}'`).join(', ') }}
      </q-item-section>
      <q-item-section class="col-auto">
        <q-btn flat label="Remove" @click="saveChange()" />
      </q-item-section>
    </q-item>
  </div>
</template>
