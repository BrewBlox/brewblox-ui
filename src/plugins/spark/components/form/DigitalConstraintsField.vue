<script setup lang="ts">
import {
  DigitalConstraintBase,
  DigitalConstraints,
  DurationConstraint,
  MutexedConstraint,
} from 'brewblox-proto/ts';
import { computed } from 'vue';
import { durationString } from '@/utils/quantity';

interface Props {
  modelValue?: DigitalConstraints;
  serviceId: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
});

defineEmits<{
  'update:modelValue': [payload: DigitalConstraints];
}>();

const isConstrained = computed<boolean>(() => {
  const { minOn, minOff, delayedOn, delayedOff, mutexed } = props.modelValue;
  return [minOn, minOff, delayedOn, delayedOff, mutexed].some(
    (v) => v?.enabled,
  );
});

function constraintClass(constraint?: DigitalConstraintBase): string[] {
  const cls: string[] = [];
  if (constraint) {
    if ((constraint as MutexedConstraint).hasLock) {
      cls.push('text-green-4');
    } else if (constraint.limiting) {
      cls.push('text-pink-4');
    } else if (constraint.enabled) {
      cls.push('text-indigo-4', 'darkish');
    }
  }
  return cls;
}

function constraintDurationString(constraint: DurationConstraint): string {
  if (constraint.limiting) {
    return `${durationString(constraint.remaining, false)} left`;
  }
  return durationString(constraint.duration);
}

function constraintMutexString(constraint: MutexedConstraint): string {
  if (constraint.limiting) {
    return Number(constraint.remaining.value) > 1
      ? `${durationString(constraint.remaining, false)} left`
      : 'waiting...';
  }
  return durationString(constraint.extraHoldTime);
}
</script>

<template>
  <div class="col-auto row q-ma-sm q-pa-sm q-gutter-x-sm">
    <div class="col-auto column">
      <div
        v-if="!isConstrained"
        class="text-italic darkish text-small"
      >
        No constraints set
      </div>

      <div
        v-if="modelValue.minOff?.enabled"
        :class="constraintClass(modelValue.minOff)"
      >
        Minimum OFF time:
        {{ constraintDurationString(modelValue.minOff) }}
      </div>
      <div
        v-if="modelValue.minOn?.enabled"
        :class="constraintClass(modelValue.minOn)"
      >
        Minimum ON time:
        {{ constraintDurationString(modelValue.minOn) }}
      </div>
      <div
        v-if="modelValue.delayedOn?.enabled"
        :class="constraintClass(modelValue.delayedOn)"
      >
        Delay ON:
        {{ constraintDurationString(modelValue.delayedOn) }}
      </div>
      <div
        v-if="modelValue.delayedOff?.enabled"
        :class="constraintClass(modelValue.delayedOff)"
      >
        Delay OFF:
        {{ constraintDurationString(modelValue.delayedOff) }}
      </div>
      <div
        v-if="modelValue.mutexed?.enabled"
        :class="constraintClass(modelValue.mutexed)"
      >
        Mutex:
        {{ constraintMutexString(modelValue.mutexed) }}
      </div>
    </div>
  </div>
</template>
