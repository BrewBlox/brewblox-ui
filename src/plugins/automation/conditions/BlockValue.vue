<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { objReducer } from '@/helpers/functional';
import { Link } from '@/helpers/units';
import { parsePostfixed, propertyNameWithoutUnit } from '@/helpers/units/parseObject';
import PostFixed from '@/helpers/units/PostFixed';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, ChangeField } from '@/plugins/spark/types';
import { featureStore } from '@/store/features';

import { StepCondition } from '../types';

type CompareOperator = 'lt' | 'le' | 'eq' | 'ne' | 'ge' | 'gt';

interface CompareOption extends SelectOption {
  desc: string;
}

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

  get compareOpts(): CompareOption[] {
    return [
      { label: '<', value: 'lt', desc: 'Less than' },
      { label: '=<', value: 'le', desc: 'Less than or equal to' },
      { label: '==', value: 'eq', desc: 'Equal to' },
      { label: '!=', value: 'ne', desc: 'Not equal to' },
      { label: '>=', value: 'ge', desc: 'More than or equal to' },
      { label: '>', value: 'gt', desc: 'More than' },
    ];
  }

  get prettyCompare(): string {
    return this.compareOpts.find(op => op.value === this.opts.operator)?.label || '??';
  }

  get currentChange(): ChangeField {
    return this.findChange(this.opts.key);
  }

  get parsed(): { key: string; value: any } {
    const optValue = this.opts.value ?? this.spec.generate()[this.opts.key];
    const [key, value] =
      parsePostfixed(this.opts.key, optValue) ?? [this.opts.key, optValue];
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

  saveEnabled(value: boolean): void {
    this.condition.enabled = value;
    this.saveCondition();
  }
}
</script>

<template>
  <q-list :class="{'darkish': !condition.enabled}" dense>
    <q-item>
      <q-item-section class="text-h6 text-italic">
        Check block value
      </q-item-section>
      <q-item-section class="col-auto">
        <q-toggle :value="condition.enabled" @input="saveEnabled">
          <q-tooltip>Toggle enabled</q-tooltip>
        </q-toggle>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <BlockField
          v-model="link"
          :service-id="opts.service"
          :clearable="false"
          class="q-mr-md"
        />
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-select :value="opts.key" :options="selectOpts" map-options emit-value label="Field" @input="saveKey" />
      </q-item-section>
      <div class="col-auto q-ml-md q-mb-sm self-end editable-field">
        <q-btn :label="prettyCompare" flat>
          <q-menu>
            <q-list>
              <ActionItem
                v-for="opt in compareOpts"
                :key="opt.value"
                :label="opt.label"
                :tooltip="opt.desc"
                @click="saveOperator(opt.value)"
              />
            </q-list>
          </q-menu>
        </q-btn>
      </div>
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
