<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Link } from '@/helpers/units';
import { parsePostfixed, propertyNameWithoutUnit } from '@/helpers/units/parseObject';
import PostFixed from '@/helpers/units/PostFixed';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, ChangeField } from '@/plugins/spark/types';
import { featureStore } from '@/store/features';

import { objReducer } from '../../../helpers/functional';
import { StepCondition } from '../types';

type CompareOperator = 'lt' | 'le' | 'eq' | 'ne' | 'ge' | 'gt';

interface BlockValueOpts {
  block: string;
  service: string;
  type: string;
  key: string;
  operator: CompareOperator;
  value: any;
}

interface BlockValueCondition extends StepCondition {
  opts: BlockValueOpts;
}

@Component
export default class BlockValue extends Vue {
  @Prop({ type: Object, required: true })
  public readonly condition!: BlockValueCondition;

  saveCondition(condition: BlockValueCondition = this.condition): void {
    this.$emit('update:condition', condition);
  }

  get opts(): BlockValueOpts {
    return this.condition.opts;
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
      this.saveCondition();
    }
  }

  get displayName(): string {
    return featureStore.displayName(this.opts.type);
  }

  get changes(): Mapped<ChangeField> {
    return this.spec.changes.reduce(objReducer('key'), {});
  }

  get selectOpts(): SelectOption[] {
    return this.spec.changes
      .map(change => {
        const generated = change.generate();
        const value = generated instanceof PostFixed
          ? generated.serialized(change.key)[0]
          : change.key;
        return { label: change.title, value };
      });
  }

  get compareOpts(): SelectOption[] {
    return [
      { label: '<', value: 'lt' },
      { label: '=<', value: 'le' },
      { label: '==', value: 'eq' },
      { label: '!=', value: 'ne' },
      { label: '>=', value: 'ge' },
      { label: '>', value: 'gt' },
    ];
  }

  get currentChange(): ChangeField {
    return this.findChange(this.opts.key);
  }

  get parsed(): { key: string; value: any } {
    const [key, value] =
      parsePostfixed(this.opts.key, this.opts.value) || [this.opts.key, this.opts.value];
    return { key, value };
  }

  findChange(key: string): ChangeField {
    const rawKey = propertyNameWithoutUnit(key);
    return this.spec.changes.find(change => change.key === rawKey)!;
  }

  rawValue(value: any): any {
    return value instanceof PostFixed
      ? value.serialized('')[1]
      : value;
  }

  saveKey(key: string): void {
    if (key === this.opts.key) { return; }
    this.condition.opts.key = key;
    this.condition.opts.value = this.rawValue(this.findChange(key).generate());
    this.saveCondition();
  }

  saveOperator(operator: CompareOperator): void {
    this.condition.opts.operator = operator;
    this.saveCondition();
  }

  saveValue(value: any): void {
    this.condition.opts.value = this.rawValue(value);
    this.saveCondition();
  }

}
</script>

<template>
  <q-list dark dense>
    <q-item dark>
      <q-item-section class="text-h6 text-italic">
        Check Block value
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
    <q-item dark>
      <q-item-section>
        <q-select
          :value="opts.key"
          :options="selectOpts"
          dark
          options-dark
          map-options
          emit-value
          label="Field"
          @input="saveKey"
        />
      </q-item-section>
      <q-item-section>
        <q-select
          :value="opts.operator"
          :options="compareOpts"
          dark
          options-dark
          map-options
          emit-value
          label="Compare"
          @input="saveOperator"
        />
      </q-item-section>
      <q-item-section class="col-5">
        <component
          :is="currentChange.component"
          v-bind="currentChange.componentProps"
          :block-id="opts.block"
          :service-id="opts.service"
          :value="parsed.value"
          :dense="false"
          editable
          lazy
          @input="saveValue"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>
