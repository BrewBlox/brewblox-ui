<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import AutomationItemBase from '@/plugins/automation/components/AutomationItemBase';
import { BlockPatchImpl } from '@/plugins/automation/types';
import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockField, BlockSpec } from '@/plugins/spark/types';

@Component
export default class BlockPatch extends AutomationItemBase<BlockPatchImpl> {

  get spec(): BlockSpec | null {
    return this.impl.blockType !== null
      ? sparkStore.specById(this.impl.blockType)
      : null;
  }

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

  get validTypes(): string[] {
    return sparkStore.specs
      .filter(spec => spec.fields.find(f => !f.readonly))
      .map(spec => spec.id);
  }

  isActive(key: string): boolean {
    return key in this.impl.data;
  }

  fieldValue(field: BlockField): any {
    return this.impl.data[field.key];
  }

  addField(field: BlockField): void {
    this.$set(this.impl.data, field.key, field.generate());
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
      component: 'ChangeFieldDialog',
      field,
      address: this.addr,
      title: `${this.addr.id} ${field.title}`,
    })
      .onOk(value => this.saveField(field, value));
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
        v-for="field in spec.changes"
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
    </template>
  </div>
</template>
