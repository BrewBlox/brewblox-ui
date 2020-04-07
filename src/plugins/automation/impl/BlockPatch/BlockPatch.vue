<script lang="ts">
import { Component } from 'vue-property-decorator';

import AutomationItemBase from '@/plugins/automation/components/AutomationItemBase';
import { BlockPatchImpl } from '@/plugins/automation/types';
import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockSpec, ChangeField } from '@/plugins/spark/types';

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
      .filter(spec => spec.changes.length)
      .map(spec => spec.id);
  }

  isActive(key: string): boolean {
    return this.impl.data[key] !== undefined;
  }

  fieldData(change: ChangeField): any {
    return this.impl.data[change.key];
  }

  addChange(change: ChangeField): void {
    this.$set(this.impl.data, change.key, change.generate());
    this.save();
  }

  saveChange(change: ChangeField, value: any): void {
    this.$set(this.impl.data, change.key, value);
    this.save();
  }

  removeChange(change: ChangeField): void {
    this.$delete(this.impl.data, change.key);
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
        v-for="change in spec.changes"
        :key="change.key"
        class="row no-wrap items-center"
      >
        <div class="col-auto">
          <template v-if="isActive(change.key)">
            <q-btn dense flat round icon="mdi-checkbox-marked-outline" @click="removeChange(change)">
              <q-tooltip>
                Remove field change from action
              </q-tooltip>
            </q-btn>
          </template>
          <template v-else>
            <q-btn dense flat round icon="mdi-checkbox-blank-outline" @click="addChange(change)">
              <q-tooltip>
                Add field change to action
              </q-tooltip>
            </q-btn>
          </template>
        </div>
        <div class="col" :class="{darkened: !isActive(change.key)}">
          {{ change.title }}
        </div>
        <div v-if="isActive(change.key)" class="col-grow">
          <component
            :is="change.component"
            v-bind="change.componentProps"
            :block-id="impl.blockId"
            :service-id="impl.serviceId"
            :value="fieldData(change)"
            editable
            lazy
            @input="v => saveChange(change, v)"
          />
        </div>
      </div>
    </template>
  </div>
</template>
