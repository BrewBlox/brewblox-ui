<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { Link } from '@/plugins/spark/bloxfield';
import { analogConstraintLabels } from '@/plugins/spark/getters';
import type { AnalogConstraint, AnalogConstraintKey, AnalogConstraintsObj } from '@/plugins/spark/types';

interface Wrapped {
  type: AnalogConstraintKey;
  constraint: AnalogConstraint;
}

@Component
export default class AnalogConstraints extends Vue {

  @Prop({ type: Object, default: () => ({ constraints: [] }) })
  protected readonly value!: AnalogConstraintsObj;

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  get constraints(): Wrapped[] {
    return this.value.constraints
      .map(constraint => {
        const type = Object.keys(constraint).find(k => k != 'limiting') as AnalogConstraintKey;
        return { type, constraint };
      });
  }

  save(constraints: Wrapped[] = this.constraints): void {
    this.$emit('input', { constraints: constraints.map(c => c.constraint) });
  }

  get constraintOpts(): SelectOption[] {
    return Object.entries(analogConstraintLabels)
      .map(([k, v]) => ({ value: k, label: v }));
  }

  createDefault(type: AnalogConstraintKey): Wrapped {
    const opts: Record<AnalogConstraintKey, AnalogConstraint> = {
      min: {
        limiting: false,
        min: 0,
      },
      max: {
        limiting: false,
        max: 100,
      },
      balanced: {
        limiting: false,
        balanced: {
          balancerId: new Link(null, 'Balancer'),
          granted: 0,
          id: 0,
        },
      },
    };
    return { type, constraint: opts[type] };
  }

  add(): void {
    createDialog({
      title: 'Add constraint',
      cancel: true,
      options: {
        type: 'checkbox',
        model: [],
        items: this.constraintOpts,
      },
    })
      .onOk(keys => {
        this.constraints.push(...keys.map(this.createDefault));
        this.save();
      });
  }

  remove(idx: number): void {
    this.$delete(this.constraints, idx);
    this.save();
  }
}
</script>

<template>
  <div class="column q-gutter-y-sm">
    <div
      v-for="({type, constraint}, idx) in constraints"
      :key="idx"
      :class="['row q-gutter-x-sm constraint', {limiting: constraint.limiting}]"
    >
      <LinkField
        v-if="type === 'balanced'"
        :service-id="serviceId"
        :value="constraint.balanced.balancerId"
        title="Balancer"
        label="Balancer"
        class="col-grow"
        @input="v => { constraint.balanced.balancerId = v; save() }"
      />
      <InputField
        v-if="type === 'min'"
        :value="constraint.min"
        title="Minimum value"
        label="Minimum value"
        type="number"
        class="col-grow"
        @input="v => { constraint.min = v; save() }"
      />
      <InputField
        v-if="type === 'max'"
        :value="constraint.max"
        title="Maximum value"
        label="Maximum value"
        type="number"
        class="col-grow"
        @input="v => { constraint.max = v; save() }"
      />

      <div class="col-auto column justify-center darkish">
        <q-btn icon="delete" flat round @click="remove(idx)">
          <q-tooltip>Remove constraint</q-tooltip>
        </q-btn>
      </div>
    </div>
    <div class="col row justify-end">
      <q-btn icon="add" round outline @click="add">
        <q-tooltip>Add constraint</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.limiting
  color: orange

.constraint:nth-child(even) > label
  background: rgba($green-5, 0.05)

.constraint:nth-child(odd) > label
  background: rgba($blue-5, 0.05)
</style>
