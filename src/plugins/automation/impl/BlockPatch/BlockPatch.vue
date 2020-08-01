<script lang="ts">
import difference from 'lodash/difference';
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import AutomationItemBase from '@/plugins/automation/components/AutomationItemBase';
import { BlockPatchImpl } from '@/plugins/automation/types';
import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockField, BlockSpec, BlockType } from '@/plugins/spark/types';

@Component
export default class BlockPatch extends AutomationItemBase<BlockPatchImpl> {

  get addr(): BlockAddress {
    return {
      id: this.impl.blockId,
      serviceId: this.impl.serviceId,
      type: this.impl.blockType,
    };
  }

  set addr(val: BlockAddress) {
    if (val.type !== this.impl.blockType) {
      this.impl.data = {};
    }
    this.impl.blockId = val.id;
    this.impl.serviceId = val.serviceId;
    this.impl.blockType = val.type ?? this.impl.blockType;
    this.save();
  }

  get spec(): BlockSpec | null {
    return sparkStore.specById(this.addr.type as BlockType) ?? null;
  }

  get fields(): BlockField[] {
    return this.spec?.fields.filter(f => !f.readonly) ?? [];
  }

  get validTypes(): BlockType[] {
    return sparkStore.specs
      .filter(spec => spec.fields.some(f => !f.readonly))
      .map(spec => spec.id);
  }

  get unknownValues(): string[] {
    if (this.spec === null) {
      return [];
    }
    const keys = Object.keys(this.impl.data);
    const validKeys = this.spec
      .fields
      .filter(f => !f.readonly)
      .map(f => f.key);
    return difference(keys, validKeys);
  }

  isActive(key: string): boolean {
    return key in this.impl.data;
  }

  fieldValue(field: BlockField): any {
    return this.impl.data[field.key];
  }

  addField(field: BlockField): void {
    this.$set(this.impl.data, field.key, field.generate(this.impl.serviceId));
    this.save();
  }

  saveField(field: BlockField, value: any): void {
    this.$set(this.impl.data, field.key, value);
    this.save();
  }

  removeField(field: BlockField): void {
    this.$delete(this.impl.data, field.key);
    this.save();
  }

  editField(field: BlockField): void {
    createDialog({
      component: 'BlockFieldDialog',
      field,
      value: this.impl.data[field.key],
      address: this.addr,
      title: `${this.addr.id} ${field.title}`,
    })
      .onOk(value => this.saveField(field, value));
  }

  fixUnknown(): void {
    this.unknownValues.forEach(k => this.$delete(this.impl.data, k));
    this.save();
  }
}
</script>

<template>
  <div class="column q-gutter-xs">
    <BlockAddressField
      v-model="addr"
      :compatible="validTypes"
      any-service
    />

    <template v-if="spec">
      <div
        v-for="field in fields"
        :key="field.key"
        class="row no-wrap items-center"
      >
        <div class="col-auto">
          <template v-if="isActive(field.key)">
            <q-btn
              dense
              flat
              round
              icon="mdi-checkbox-marked-outline"
              @click="removeField(field)"
            >
              <q-tooltip>
                Remove field change from action
              </q-tooltip>
            </q-btn>
          </template>
          <template v-else>
            <q-btn
              dense
              flat
              round
              icon="mdi-checkbox-blank-outline"
              @click="addField(field)"
            >
              <q-tooltip>
                Add field change to action
              </q-tooltip>
            </q-btn>
          </template>
        </div>
        <div class="col" :class="{darkened: !isActive(field.key)}">
          {{ field.title }}
        </div>
        <div v-if="isActive(field.key)" class="col-grow">
          <component
            :is="field.component"
            v-bind="field.componentProps"
            :block-id="impl.blockId"
            :service-id="impl.serviceId"
            :value="fieldValue(field)"
            @input="v => saveField(field, v)"
            @edit="editField(field)"
          />
        </div>
      </div>
      <CardWarning v-if="unknownValues.length">
        <template #message>
          Unknown fields: {{ unknownValues.map(v => `'${v}'`).join(', ') }}
        </template>
        <template #actions>
          <q-btn flat label="Fix now" @click="fixUnknown" />
        </template>
      </CardWarning>
    </template>
  </div>
</template>
