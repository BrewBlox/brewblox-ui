<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import AutomationItemBase from '@/plugins/automation/components/AutomationItemBase';
import { BlockValueImpl } from '@/plugins/automation/types';
import { sparkStore } from '@/plugins/spark/store';
import { BlockField, BlockFieldAddress } from '@/plugins/spark/types';

import { OperatorOption, operatorSymbols } from './helpers';

@Component
export default class BlockValue extends AutomationItemBase<BlockValueImpl> {
  compareOpts = operatorSymbols;

  get addr(): BlockFieldAddress {
    return {
      id: this.impl.blockId,
      serviceId: this.impl.serviceId,
      type: this.impl.blockType,
      field: this.impl.key,
    };
  }

  set addr(val: BlockFieldAddress) {
    const { blockType, key } = this.impl;
    if (val.type !== blockType || val.field !== key) {
      this.impl.value = sparkStore.fieldSpec(val)?.generate(val.serviceId) ?? null;
    }
    this.impl.blockId = val.id;
    this.impl.serviceId = val.serviceId;
    this.impl.blockType = val.type ?? this.impl.blockType;
    this.impl.key = val.field;
    this.save();
  }

  get fieldSpec(): BlockField | null {
    return sparkStore.fieldSpec(this.addr);
  }

  get operator(): OperatorOption {
    return this.compareOpts.find(op => op.value === this.impl.operator)
      || this.compareOpts[0];
  }

  set operator(opt: OperatorOption) {
    this.impl.operator = opt.value;
    this.save();
  }

  saveValue(value: any): void {
    this.impl.value = value;
    this.save();
  }

  editField(): void {
    if (this.fieldSpec === null) {
      return;
    }
    createDialog({
      component: 'ChangeFieldDialog',
      field: this.fieldSpec,
      address: this.addr,
      value: this.impl.value,
      title: `${this.addr.id} ${this.fieldSpec.title}`,
    })
      .onOk(value => this.saveValue(value));
  }
}
</script>

<template>
  <div class="row q-gutter-xs">
    <BlockFieldAddressField
      v-model="addr"
      class="col-grow"
    />
    <div
      v-if="fieldSpec"
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
        :is="fieldSpec.component"
        v-bind="fieldSpec.componentProps"
        :block-id="impl.blockId"
        :service-id="impl.serviceId"
        :value="impl.value"
        class="col-grow self-center"
        @input="saveValue"
        @edit="editField"
      />
    </div>
  </div>
</template>
