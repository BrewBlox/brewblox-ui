<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { Link, Time } from '@/helpers/units';
import { blockTypes, MutexBlock } from '@/plugins/spark/block-types';
import { digitalConstraintLabels } from '@/plugins/spark/getters';
import { sparkStore } from '@/plugins/spark/store';
import {
  DigitalConstraint,
  DigitalConstraintKey,
  DigitalConstraintsObj,
  MutexedConstraint,
} from '@/plugins/spark/types';

interface Wrapped {
  type: DigitalConstraintKey;
  constraint: DigitalConstraint;
}

@Component
export default class DigitalConstraints extends Vue {
  @Prop({ type: Object, default: () => ({ constraints: [] }) })
  protected readonly value!: DigitalConstraintsObj;

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

  get constraintOpts(): SelectOption[] {
    return Object.entries(digitalConstraintLabels)
      .map(([k, v]) => ({ value: k, label: v }));
  }

  createDefault(type: DigitalConstraintKey): Wrapped {
    const opts: Record<DigitalConstraintKey, DigitalConstraint> = {
      minOff: {
        remaining: new Time(),
        minOff: new Time(),
      },
      minOn: {
        remaining: new Time(),
        minOn: new Time(),
      },
      mutexed: {
        remaining: new Time(),
        mutexed: {
          mutexId: new Link(null, blockTypes.Mutex),
          hasCustomHoldTime: false,
          extraHoldTime: new Time(),
          holdTimeRemaining: new Time(),
        },
      },
    };
    return { type, constraint: opts[type] };
  }

  isCustom(constraint: MutexedConstraint): boolean {
    return constraint.mutexed.hasCustomHoldTime;
  }

  holdTime(constraint: MutexedConstraint): Time {
    if (this.isCustom(constraint)) {
      return constraint.mutexed.extraHoldTime;
    }
    else if (constraint.mutexed.mutexId.id) {
      const mutex: MutexBlock = sparkStore.blockById(
        this.serviceId,
        constraint.mutexed.mutexId.id);
      return mutex?.data.differentActuatorWait ?? new Time();
    }
    else {
      return new Time();
    }
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
  <div class="column q-gutter-y-xs">
    <div
      v-for="({type, constraint}, idx) in constraints"
      :key="idx"
      :class="['row q-gutter-x-sm q-gutter-y-xs constraint', {limiting: constraint.remaining.value}]"
    >
      <template v-if="type === 'mutexed'">
        <BlockField
          :service-id="serviceId"
          :value="constraint.mutexed.mutexId"
          title="Mutex"
          label="Mutex"
          class="col-grow"
          @input="v => { constraint.mutexed.mutexId = v; save(); }"
        />
        <TimeUnitField
          :value="holdTime(constraint)"
          title="Lockout period"
          label="Lockout period"
          class="col-grow"
          :tooltip="
            isCustom(constraint)
              ? null
              : 'Using default value from Mutex block.'
          "
          @input="v => {
            constraint.mutexed.extraHoldTime = v;
            constraint.mutexed.hasCustomHoldTime = true;
            save();
          }"
        >
          <template #append>
            <template v-if="isCustom(constraint)">
              <q-btn
                flat
                round
                icon="mdi-backup-restore"
                size="sm"
                @click.stop="constraint.mutexed.hasCustomHoldTime = false; save()"
              >
                <q-tooltip>Use default value from Mutex block.</q-tooltip>
              </q-btn>
            </template>
          </template>
        </TimeUnitField>
      </template>
      <TimeUnitField
        v-if="type === 'minOff'"
        :value="constraint.minOff"
        title="Minimum OFF new Time"
        label="Minimum OFF new Time"
        class="col-grow"
        @input="v => { constraint.minOff = v; save(); }"
      />
      <TimeUnitField
        v-if="type === 'minOn'"
        :value="constraint.minOn"
        title="Minimum ON new Time"
        label="Minimum ON new Time"
        class="col-grow"
        @input="v => { constraint.minOn = v; save(); }"
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
  text-color: orange;

.constraint:nth-child(even) > label
  background: rgba($green-5, 0.05)

.constraint:nth-child(odd) > label
  background: rgba($blue-5, 0.05)
</style>
