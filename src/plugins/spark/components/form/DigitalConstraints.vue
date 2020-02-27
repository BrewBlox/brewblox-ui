<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { Link, Unit } from '@/helpers/units';
import { blockTypes } from '@/plugins/spark/block-types';
import { ConstraintsObjDigital, DigitalConstraint, DigitalConstraintKey } from '@/plugins/spark/types';

interface Wrapped {
  type: DigitalConstraintKey;
  constraint: DigitalConstraint;
}

const emptyTime = (): Unit => new Unit(0, 'seconds');

@Component
export default class DigitalConstraints extends Vue {
  @Prop({ type: Object, default: () => ({ constraints: [] }) })
  protected readonly value!: ConstraintsObjDigital;

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  get constraints(): Wrapped[] {
    return this.value.constraints
      .map(constraint => {
        const type = Object.keys(constraint).find(k => k != 'remaining') as DigitalConstraintKey;
        return { type, constraint };
      });
  }

  save(constraints: Wrapped[] = this.constraints): void {
    this.$emit('input', { constraints: constraints.map(c => c.constraint) });
  }

  createDefault(type: DigitalConstraintKey): Wrapped {
    const opts: Record<DigitalConstraintKey, DigitalConstraint> = {
      minOff: {
        remaining: emptyTime(),
        minOff: emptyTime(),
      },
      minOn: {
        remaining: emptyTime(),
        minOn: emptyTime(),
      },
      mutexed: {
        remaining: emptyTime(),
        mutexed: {
          mutexId: new Link(null, blockTypes.Mutex),
          hasCustomHoldTime: false,
          extraHoldTime: emptyTime(),
          holdTimeRemaining: emptyTime(),
        },
      },
    };
    return {
      type,
      constraint: opts[type],
    };
  }

  createConstraint(key: DigitalConstraintKey, value: any = null): EditableConstraint {
    switch (key) {
      case 'mutexed':
        return {
          key,
          value: new Link(value, blockTypes.Mutex),
          limiting: false,
        };
      default:
        return {
          key,
          value: new Unit(0, 'second'),
          limiting: false,
        };
    }
  }

  addConstraint(): void {
    createDialog({
      title: 'Add constraint',
      cancel: true,
      options: {
        type: 'checkbox',
        model: [],
        items: this.constraintOptions,
      },
    })
      .onOk(keys => {
        this.constraints.push(...keys.map(this.createConstraint));
        this.save();
      });
  }
}
</script>

<template>
  <div class="column q-gutter-y-sm">
    <div
      v-for="(editable, idx) in constraints"
      :key="idx"
      :class="['row q-gutter-x-sm constraint', {limiting: editable.limiting}]"
    >
      <SelectField
        :value="editable.key"
        :options="constraintOptions"
        clearable
        title="Constraint type"
        label="Constraint"
        class="col-grow"
        @input="k => { constraints[idx] = createConstraint(k); saveConstraints() }"
      />
      <BlockField
        v-if="editable.key === 'mutex'"
        :service-id="serviceId"
        :value="editable.value"
        title="Mutex"
        label="Mutex"
        class="col-grow"
        @input="v => { editable.value = v; saveConstraints(); }"
      />
      <TimeUnitField
        v-else
        :value="editable.value"
        title="Constraint value"
        label="Duration"
        class="col-grow"
        @input="v => { editable.value = v; saveConstraints(); }"
      />
      <div class="col-auto column justify-center darkish">
        <q-btn icon="delete" flat round @click="removeConstraint(idx); saveConstraints();">
          <q-tooltip>Remove constraint</q-tooltip>
        </q-btn>
      </div>
    </div>
    <div class="col row justify-end">
      <q-btn icon="add" round outline @click="addConstraint">
        <q-tooltip>Add constraint</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.limiting
  color: orange;

.constraint:nth-child(even) > label
  background: rgba($green-5, 0.05)

.constraint:nth-child(odd) > label
  background: rgba($blue-5, 0.05)
</style>
