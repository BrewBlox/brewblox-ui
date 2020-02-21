<script lang="ts">
import { Component } from 'vue-property-decorator';

import { Link } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, ChangeField } from '@/plugins/spark/types';

import { BlockPatchImpl } from '../types';
import ActionBase from './ActionBase';

@Component
export default class BlockPatch extends ActionBase<BlockPatchImpl> {

  get spec(): BlockSpec {
    return sparkStore.specs[this.impl.blockType];
  }

  get link(): Link {
    return new Link(this.impl.blockId, this.impl.blockType);
  }

  set link(val: Link) {
    if (val.id !== null) {
      this.impl.blockId = val.id;
      this.saveAction();
    }
  }

  isActive(key: string): boolean {
    return this.impl.data[key] !== undefined;
  }

  fieldData(change: ChangeField): any {
    return this.impl.data[change.key];
  }

  addChange(change: ChangeField): void {
    this.$set(this.impl.data, change.key, change.generate());
    this.saveAction();
  }

  saveChange(change: ChangeField, value: any): void {
    this.$set(this.impl.data, change.key, value);
    this.saveAction();
  }

  removeChange(change: ChangeField): void {
    this.$delete(this.impl.data, change.key);
    this.saveAction();
  }

  saveEnabled(value: boolean): void {
    this.action.enabled = value;
    this.saveAction();
  }
}
</script>

<template>
  <div class="column q-px-md q-gutter-xs">
    <AutomationFieldHeader
      :enabled="action.enabled"
      label="Create Task"
      @update:enabled="saveEnabled"
    />

    <BlockField
      v-model="link"
      :service-id="impl.serviceId"
      :clearable="false"
    />

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
      <div v-if="isActive(change.key)" class="col">
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
  </div>
</template>
