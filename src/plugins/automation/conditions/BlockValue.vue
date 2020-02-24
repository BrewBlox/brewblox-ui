<script lang="ts">
import { Component } from 'vue-property-decorator';

import { objReducer } from '@/helpers/functional';
import { Link } from '@/helpers/units';
import { parsePostfixed, propertyNameWithoutUnit } from '@/helpers/units/parseObject';
import PostFixed from '@/helpers/units/PostFixed';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, ChangeField } from '@/plugins/spark/types';

import { BlockValueImpl } from '../types';
import ConditionBase from './ConditionBase';

type CompareOperator = BlockValueImpl['operator'];

interface OperatorOption extends SelectOption {
  desc: string;
}

@Component
export default class BlockValue extends ConditionBase<BlockValueImpl> {

  get spec(): BlockSpec {
    return sparkStore.specs[this.impl.blockType];
  }

  get link(): Link {
    return new Link(this.impl.blockId, this.impl.blockType);
  }

  set link(val: Link) {
    if (val.id !== null) {
      this.impl.blockId = val.id;
      this.saveCondition();
    }
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

  get compareOpts(): OperatorOption[] {
    return [
      { label: '==', value: 'eq', desc: 'Equal to' },
      { label: '!=', value: 'ne', desc: 'Not equal to' },
      { label: '<', value: 'lt', desc: 'Less than' },
      { label: '=<', value: 'le', desc: 'Less than or equal to' },
      { label: '>=', value: 'ge', desc: 'More than or equal to' },
      { label: '>', value: 'gt', desc: 'More than' },
    ];
  }

  get operator(): OperatorOption {
    return this.compareOpts.find(op => op.value === this.impl.operator) || this.compareOpts[0];
  }

  set operator(opt: OperatorOption) {
    this.condition.impl.operator = opt.value;
    this.saveCondition();
  }

  get currentChange(): ChangeField {
    return this.findChange(this.impl.key);
  }

  get parsed(): { key: string; value: any } {
    const optValue = this.impl.value ?? this.spec.generate()[this.impl.key];
    const [key, value] =
      parsePostfixed(this.impl.key, optValue) ?? [this.impl.key, optValue];
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
    if (key === this.impl.key) { return; }
    this.condition.impl.key = key;
    this.condition.impl.value = this.rawValue(this.findChange(key).generate());
    this.saveCondition();
  }

  saveValue(value: any): void {
    this.condition.impl.value = this.rawValue(value);
    this.saveCondition();
  }
}
</script>

<template>
  <div class="row q-gutter-xs">
    <BlockField
      v-model="link"
      :service-id="impl.serviceId"
      :clearable="false"
      class="col-grow"
    />
    <SelectField
      :value="impl.key"
      :options="selectOpts"
      label="Field"
      class="col-grow"
      @input="saveKey"
    />

    <div class="col-break" />

    <div class="col-grow row justify-between q-px-sm">
      <q-select
        v-model="operator"
        :options="compareOpts"
        dense
        label="Compare"
        class="col-auto"
        style="min-width: 100px"
      />
      <component
        :is="currentChange.component"
        v-bind="currentChange.componentProps"
        :block-id="impl.blockId"
        :service-id="impl.serviceId"
        :value="parsed.value"
        editable
        lazy
        class="col-auto"
        @input="saveValue"
      />
    </div>
  </div>
</template>
