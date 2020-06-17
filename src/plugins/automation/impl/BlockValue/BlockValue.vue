<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import AutomationItemBase from '@/plugins/automation/components/AutomationItemBase';
import { BlockValueImpl } from '@/plugins/automation/types';
import { isPostFixed, parsePostfixed, propertyNameWithoutUnit } from '@/plugins/spark/parse-object';
import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockField, BlockSpec, BlockType } from '@/plugins/spark/types';

import { OperatorOption, operatorSymbols } from './helpers';

@Component
export default class BlockValue extends AutomationItemBase<BlockValueImpl> {
  compareOpts = operatorSymbols;

  get spec(): BlockSpec | null {
    return this.impl.blockType !== null
      ? sparkStore.specById(this.impl.blockType as BlockType) ?? null
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

  get validTypes(): string[] {
    return sparkStore.specs
      .filter(spec => spec.fields.find(f => !f.readonly))
      .map(spec => spec.id);
  }

  get selectOpts(): SelectOption[] {
    return this.spec !== null
      ? this.spec
        .fields
        .map(field => {
          const generated = field.generate(this.impl.serviceId);
          const value = isPostFixed(generated)
            ? generated.toSerialized(field.key)[0]
            : field.key;
          return { label: field.title, value };
        })
      : [];
  }

  get operator(): OperatorOption {
    return this.compareOpts.find(op => op.value === this.impl.operator)
      || this.compareOpts[0];
  }

  set operator(opt: OperatorOption) {
    this.item.impl.operator = opt.value;
    this.save();
  }

  get field(): BlockField | null {
    return this.findField(this.impl.key);
  }

  get parsed(): { key: string; value: any } | null {
    if (this.spec === null || this.impl.key === null) {
      return null;
    }
    const optValue = this.impl.value ?? this.spec.generate(this.impl.serviceId)[this.impl.key];
    const [key, value] =
      parsePostfixed(this.impl.key, optValue) ?? [this.impl.key, optValue];
    return { key, value };
  }

  findField(key: string | null): BlockField | null {
    if (this.spec === null || key === null) {
      return null;
    }
    const rawKey = propertyNameWithoutUnit(key);
    return this.spec.fields.find(field => field.key === rawKey)!;
  }

  rawValue(value: any): any {
    return isPostFixed(value)
      ? value.toSerialized('')[1]
      : value;
  }

  defaultValue(key: string | null): any {
    if (this.spec === null || key === null) {
      return null;
    }
    const change = this.findField(key);
    return change
      ? this.rawValue(change.generate(this.impl.serviceId))
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

  editField(): void {
    if (this.field === null || this.parsed === null) {
      return;
    }
    createDialog({
      component: 'ChangeFieldDialog',
      field: this.field,
      address: this.addr,
      value: this.parsed.value,
      title: `${this.addr.id} ${this.field.title}`,
    })
      .onOk(value => this.saveValue(value));
  }
}
</script>

<template>
  <div class="row q-gutter-xs">
    <BlockAddressField
      v-model="addr"
      :compatible="validTypes"
      any-service
      class="col-grow"
    />
    <div class="col-break" />
    <SelectField
      :value="impl.key"
      :options="selectOpts"
      label="Field"
      class="col-grow"
      @input="saveKey"
    />
    <div
      v-if="spec && impl.key"
      class="col-grow row q-gutter-x-sm q-px-sm"
    >
      <q-select
        v-model="operator"
        :options="compareOpts"
        dense
        label="Compare"
        class="col-grow"
      >
        <q-tooltip>{{ operator.desc }}</q-tooltip>
      </q-select>
      <component
        :is="field.component"
        v-bind="field.componentProps"
        :block-id="impl.blockId"
        :service-id="impl.serviceId"
        :value="parsed.value"
        class="col-grow self-center"
        @input="saveValue"
        @edit="editField"
      />
    </div>
  </div>
</template>
