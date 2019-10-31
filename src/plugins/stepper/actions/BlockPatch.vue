<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Link } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, ChangeField } from '@/plugins/spark/types';
import { featureStore } from '@/store/features';

import { StepAction } from '../types';

interface BlockPatchOpts {
  block: string;
  service: string;
  type: string;
  data: Mapped<any>;
}

interface BlockPatchAction extends StepAction {
  opts: BlockPatchOpts;
}

@Component
export default class BlockPatch extends Vue {
  @Prop({ type: Object, required: true })
  public readonly action!: BlockPatchAction;

  saveAction(action: BlockPatchAction = this.action): void {
    this.$emit('update:action', action);
  }

  get opts(): BlockPatchOpts {
    return this.action.opts;
  }

  get spec(): BlockSpec {
    return sparkStore.specs[this.opts.type];
  }

  get link(): Link {
    return new Link(this.opts.block, this.opts.type);
  }

  set link(val: Link) {
    if (val.id !== null) {
      this.opts.block = val.id;
      this.saveAction();
    }
  }

  get displayName(): string {
    return featureStore.displayName(this.opts.type);
  }

  isActive(key: string): boolean {
    return this.opts.data[key] !== undefined;
  }

  fieldData(change: ChangeField): any {
    return this.opts.data[change.key];
  }

  addChange(change: ChangeField): void {
    this.$set(this.opts.data, change.key, change.generate());
    this.saveAction();
  }

  saveChange(change: ChangeField, value: any): void {
    this.$set(this.opts.data, change.key, value);
    this.saveAction();
  }

  removeChange(change: ChangeField): void {
    this.$delete(this.opts.data, change.key);
    this.saveAction();
  }
}
</script>

<template>
  <q-list dark dense>
    <q-item dark>
      <q-item-section class="text-h6 text-italic">
        Change Block
      </q-item-section>
      <q-item-section class="col-auto">
        <LinkField
          v-model="link"
          :service-id="opts.service"
          :clearable="false"
          tag="big"
        />
      </q-item-section>
    </q-item>
    <q-item
      v-for="change in spec.changes"
      :key="change.key"
      dark
    >
      <q-item-section :class="{darkened: !isActive(change.key)}">
        {{ change.title }}
      </q-item-section>
      <q-item-section v-if="isActive(change.key)">
        <component
          :is="change.component"
          v-bind="change.componentProps"
          :block-id="opts.block"
          :service-id="opts.service"
          :value="fieldData(change)"
          editable
          lazy
          @input="v => saveChange(change, v)"
        />
      </q-item-section>
      <q-item-section class="col-auto">
        <template v-if="isActive(change.key)">
          <q-btn flat round icon="delete" @click="removeChange(change)">
            <q-tooltip>
              Remove field change from action
            </q-tooltip>
          </q-btn>
        </template>
        <template v-else>
          <q-btn flat round icon="add" @click="addChange(change)">
            <q-tooltip>
              Add field change to action
            </q-tooltip>
          </q-btn>
        </template>
      </q-item-section>
    </q-item>
  </q-list>
</template>
