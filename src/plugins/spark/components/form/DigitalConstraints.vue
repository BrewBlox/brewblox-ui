<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';

import { digitalConstraintLabels } from '@/plugins/spark/const';
import { sparkStore } from '@/plugins/spark/store';
import type {
  DigitalConstraint,
  DigitalConstraintKey,
  DigitalConstraintsObj,
  MutexedConstraint,
} from '@/plugins/spark/types';
import { BlockType, MutexBlock, Quantity } from '@/plugins/spark/types';
import { createDialog } from '@/utils/dialog';
import { bloxLink } from '@/utils/link';
import { deepCopy } from '@/utils/objects';
import { bloxQty } from '@/utils/quantity';


const constraintOpts: SelectOption[] =
  Object.entries(digitalConstraintLabels)
    .map(([k, v]) => ({ value: k, label: v }));

const defaultValues: Record<DigitalConstraintKey, DigitalConstraint> = {
  minOff: {
    remaining: bloxQty('0s'),
    minOff: bloxQty('0s'),
  },
  minOn: {
    remaining: bloxQty('0s'),
    minOn: bloxQty('0s'),
  },
  delayedOff: {
    remaining: bloxQty('0s'),
    delayedOff: bloxQty('0s'),
  },
  delayedOn: {
    remaining: bloxQty('0s'),
    delayedOn: bloxQty('0s'),
  },
  mutexed: {
    remaining: bloxQty('0s'),
    mutexed: {
      mutexId: bloxLink(null, BlockType.Mutex),
      hasCustomHoldTime: false,
      extraHoldTime: bloxQty('0s'),
      hasLock: false,
    },
  },
};

export default defineComponent({
  name: 'DigitalConstraints',
  props: {
    modelValue: {
      type: Object as PropType<DigitalConstraintsObj>,
      default: () => ({ constraints: [] }),
    },
    serviceId: {
      type: String,
      required: true,
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
    const constraints = ref<DigitalConstraint[]>([]);

    watch(
      () => props.modelValue,
      (newV) => constraints.value = deepCopy(newV.constraints),
      { deep: true, immediate: true },
    );

    function save(): void {
      emit('update:modelValue', { constraints: constraints.value });
    }

    function isCustom(constraint: MutexedConstraint): boolean {
      return constraint.mutexed.hasCustomHoldTime;
    }

    function holdTime(constraint: MutexedConstraint): Quantity {
      if (isCustom(constraint)) {
        return constraint.mutexed.extraHoldTime;
      }
      else if (constraint.mutexed.mutexId.id) {
        const mutex = sparkStore.blockById<MutexBlock>(
          props.serviceId,
          constraint.mutexed.mutexId.id);
        return mutex?.data.differentActuatorWait ?? bloxQty('0s');
      }
      else {
        return bloxQty('0s');
      }
    }

    function add(): void {
      createDialog({
        component: 'CheckboxDialog',
        componentProps: {
          title: 'Add constraint',
          selectOptions: constraintOpts,
        },
      })
        .onOk(keys => {
          constraints.value.push(...keys.map(type => deepCopy(defaultValues[type])));
          save();
        });
    }

    function remove(idx: number): void {
      constraints.value.splice(idx, 1);
      save();
    }

    return {
      constraints,
      save,
      isCustom,
      holdTime,
      add,
      remove,
    };
  },
});
</script>

<template>
  <div class="column q-gutter-y-xs">
    <div
      v-for="(constraint, idx) in constraints"
      :key="idx"
      :class="[
        'row q-gutter-x-sm q-gutter-y-xs constraint',
        { limiting: constraint.remaining.value }
      ]"
    >
      <template v-if="'mutexed' in constraint">
        <LinkField
          :service-id="serviceId"
          :model-value="constraint.mutexed.mutexId"
          title="Mutex"
          label="Mutex"
          class="col-grow"
          @update:model-value="v => { constraint.mutexed.mutexId = v; save(); }"
        />
        <DurationField
          :model-value="holdTime(constraint)"
          title="Extra lock time"
          label="Extra lock time"
          message="The Mutex will be kept locked for this duration after the actuator turns off."
          class="col-grow"
          :tooltip="
            isCustom(constraint)
              ? null
              : 'Using default value from Mutex block.'
          "
          @update:model-value="v => {
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
        </DurationField>
      </template>
      <DurationField
        v-if="'minOff' in constraint"
        :model-value="constraint.minOff"
        title="Minimum OFF period"
        label="Minimum OFF period"
        class="col-grow"
        @update:model-value="v => { constraint.minOff = v; save(); }"
      />
      <DurationField
        v-if="'minOn' in constraint"
        :model-value="constraint.minOn"
        title="Minimum ON period"
        label="Minimum ON period"
        class="col-grow"
        @update:model-value="v => { constraint.minOn = v; save(); }"
      />
      <DurationField
        v-if="'delayedOff' in constraint"
        :model-value="constraint.delayedOff"
        title="Delay OFF"
        label="Delay OFF"
        class="col-grow"
        @update:model-value="v => { constraint.delayedOff = v; save(); }"
      />
      <DurationField
        v-if="'delayedOn' in constraint"
        :model-value="constraint.delayedOn"
        title="Delay ON"
        label="Delay ON"
        class="col-grow"
        @update:model-value="v => { constraint.delayedOn = v; save(); }"
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
  text-color: orange

.constraint:nth-child(even) > label
  background: rgba($green-5, 0.05)

.constraint:nth-child(odd) > label
  background: rgba($blue-5, 0.05)
</style>
