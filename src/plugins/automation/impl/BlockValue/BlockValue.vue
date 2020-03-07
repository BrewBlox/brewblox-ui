<script lang="ts">
import { Component } from 'vue-property-decorator';

import { parsePostfixed, propertyNameWithoutUnit } from '@/helpers/units/parseObject';
import PostFixed from '@/helpers/units/PostFixed';
import AutomationItemBase from '@/plugins/automation/components/AutomationItemBase';
import { BlockValueImpl } from '@/plugins/automation/types';
import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockSpec, ChangeField } from '@/plugins/spark/types';

type CompareOperator = BlockValueImpl['operator'];

interface OperatorOption extends SelectOption {
  desc: string;
}

@Component
export default class BlockValue extends AutomationItemBase<BlockValueImpl> {

  get spec(): BlockSpec | null {
    return this.impl.blockType !== null
      ? sparkStore.specs[this.impl.blockType] ?? null
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
      this.impl.key = null;
      this.impl.value = null;
    }
    this.impl.blockId = val.id;
    this.impl.serviceId = val.serviceId;
    this.impl.blockType = val.type ?? this.impl.blockType;
    this.save();
  }

  get typeFilter(): (type: string) => boolean {
    const valid = sparkStore.specValues
      .filter(spec => spec.changes.length)
      .map(spec => spec.id);
    return type => valid.includes(type);
  }

  get selectOpts(): SelectOption[] {
    return this.spec !== null
      ? this.spec.changes
        .map(change => {
          const generated = change.generate();
          const value = generated instanceof PostFixed
            ? generated.serialized(change.key)[0]
            : change.key;
          return { label: change.title, value };
        })
      : [];
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
    this.item.impl.operator = opt.value;
    this.save();
  }

  get currentChange(): ChangeField | null {
    return this.findChange(this.impl.key);
  }

  get parsed(): { key: string; value: any } | null {
    if (this.spec === null || this.impl.key === null) {
      return null;
    }
    const optValue = this.impl.value ?? this.spec.generate()[this.impl.key];
    const [key, value] =
      parsePostfixed(this.impl.key, optValue) ?? [this.impl.key, optValue];
    return { key, value };
  }

  findChange(key: string | null): ChangeField | null {
    if (this.spec === null || key === null) {
      return null;
    }
    const rawKey = propertyNameWithoutUnit(key);
    return this.spec.changes.find(change => change.key === rawKey)!;
  }

  rawValue(value: any): any {
    return value instanceof PostFixed
      ? value.serialized('')[1]
      : value;
  }

  defaultValue(key: string | null): any {
    if (this.spec === null || key === null) {
      return null;
    }
    const change = this.findChange(key);
    return change
      ? this.rawValue(change.generate())
      : null;
  }

  saveKey(key: string | null): void {
    if (key !== this.impl.key) {
      this.impl.key = key;
      this.impl.value = this.defaultValue(key);
      this.save();
    }
  }

  saveValue(value: any): void {
    this.item.impl.value = this.rawValue(value);
    this.save();
  }
}
</script>

<template>
  <div class="row q-gutter-xs">
    <BlockAddressField
      v-model="addr"
      class="col-grow"
      :type-filter="typeFilter"
      any-service
      clearable
    />
    <SelectField
      :value="impl.key"
      :options="selectOpts"
      label="Field"
      class="col-grow"
      @input="saveKey"
    />

    <div class="col-break" />

    <div v-if="spec && impl.key" class="col-grow row justify-between q-px-sm">
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
