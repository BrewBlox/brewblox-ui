<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { spliceById } from '@/helpers/functional';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockSpec, ChangeField } from '@/plugins/spark/types';
import { featureStore } from '@/store/features';

import { BlockChange } from './types';

interface EditableFieldChange {
  id: string;
  value: any;
  confirmed: boolean;
  cfield: ChangeField;
}

interface EditableBlockChange {
  id: string;
  blockId: string;
  block: Block | null;
  spec: BlockSpec | null;
  displayName: string;
  fields: EditableFieldChange[];
}

@Component
export default class QuickActionChange extends Vue {
  editable = false;

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  @Prop({ type: Object, required: true })
  public readonly value!: BlockChange;

  get specs(): BlockSpec[] {
    return sparkStore.specValues;
  }

  get change(): EditableBlockChange {
    const block = sparkStore.tryBlockById(this.serviceId, this.value.blockId);
    const spec = block !== null
      ? this.specs.find(s => s.id === block.type) ?? null
      : null;

    const data = this.value.data ?? {};
    const confirmed = this.value.confirmed ?? {};

    return {
      id: this.value.id,
      blockId: this.value.blockId,
      block,
      spec,
      displayName: block ? featureStore.displayName(block.type) : 'Unknown',
      fields: spec?.changes.map(cfield => ({
        cfield,
        id: cfield.key,
        value: data[cfield.key] ?? null,
        confirmed: confirmed[cfield.key] ?? false,
      })) ?? [],
    };
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

  saveField(field: EditableFieldChange): void {
    spliceById(this.change.fields, field);
    this.saveChange();
  }

  toggleField(field: EditableFieldChange): void {
    field.value = field.value === null
      ? field.cfield.generate()
      : null;
    this.saveField(field);
  }
}
</script>

<template>
  <q-list
    v-if="editable"
    class="q-mb-sm"
    bordered
    dense
  >
    <q-item>
      <q-item-section class="text-h6 grabbable">
        {{ change.blockId }}
      </q-item-section>
      <q-item-section side>
        <q-btn flat round icon="clear" @click="removeChange(step, change.key)">
          <q-tooltip>Remove Block Change from Step</q-tooltip>
        </q-btn>
      </q-item-section>
      <q-item-section side>
        <q-btn flat round icon="mdi-rename-box" @click="editChangeBlock(step, change.key)">
          <q-tooltip>Switch target Block</q-tooltip>
        </q-btn>
      </q-item-section>
      <q-item-section side>
        <q-btn
          round
          flat
          icon="mdi-pencil-off"
          @click="editable = false"
        >
          <q-tooltip>Stop editing</q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>
    <q-item v-for="field in change.fields" :key="field.id">
      <q-item-section class="col-auto">
        <q-btn
          :icon="field.value === null
            ? 'mdi-checkbox-blank-outline'
            : 'mdi-checkbox-marked-outline'"
          flat
          dense
          @click="toggleField(field)"
        >
          <q-tooltip>Change value when the Step is applied.</q-tooltip>
        </q-btn>
      </q-item-section>
      <q-item-section class="col-auto">
        <q-btn
          :color="field.confirmed ? 'primary' : ''"
          :disable="field.value === null"
          flat
          dense
          icon="mdi-comment-question"
          @click="field.confirmed = !field.confirmed; saveField(field)"
        >
          <q-tooltip>Edit value when the Step is applied.</q-tooltip>
        </q-btn>
      </q-item-section>
      <q-item-section class="col-shrink">
        {{ field.cfield.title }}
      </q-item-section>
      <q-space />
      <q-item-section class="col-6">
        <component
          :is="field.cfield.component"
          v-if="field.value !== null"
          v-bind="field.cfield.componentProps"
          :service-id="serviceId"
          :block-id="change.blockId"
          :value="field.value"
          class="self-end"
          editable
          @input="v => { field.value = v; saveField(field)}"
        />
      </q-item-section>
    </q-item>
  </q-list>

  <q-list
    v-else
    class="q-mb-sm"
    bordered
    dense
  >
    <q-item>
      <q-item-section
        :class="{'text-h6': true, grabbable: true, 'text-red': !change.block}"
      >
        {{ change.blockId }}
        <q-tooltip v-if="!change.block">
          Block not found
        </q-tooltip>
      </q-item-section>
      <q-item-section side>
        <q-btn
          flat
          round
          icon="mdi-pencil"
          @click="editable = true"
        >
          <q-tooltip>Edit Block Change</q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>
    <template v-for="field in change.fields">
      <q-item v-if="field.value !== null" :key="`${change.blockId}--${field.id}`">
        <q-item-section class="col-shrink">
          {{ field.cfield.title }}
        </q-item-section>
        <q-space />
        <q-item-section class="col-6">
          <component
            :is="field.cfield.component"
            v-bind="field.cfield.componentProps"
            :service-id="serviceId"
            :block-id="change.blockId"
            :value="field.value"
          />
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<style scoped>
.grabbable {
  cursor: grab;
}
</style>
