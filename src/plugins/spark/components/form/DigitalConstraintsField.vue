<script lang="ts">
import { durationString, prettyLink } from '@/utils/quantity';
import {
  DigitalConstraintBase,
  DigitalConstraints,
  DurationConstraint,
  MutexedConstraint,
} from 'brewblox-proto/ts';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'DigitalConstraintsField',
  props: {
    modelValue: {
      type: Object as PropType<DigitalConstraints>,
      default: () => ({}),
    },
    serviceId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const constraints = computed<DigitalConstraints>(() => props.modelValue);

    const isConstrained = computed<boolean>(() => {
      const { minOn, minOff, delayedOn, delayedOff, mutexed } =
        constraints.value;
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

    return {
      constraints,
      isConstrained,
      prettyLink,
      durationString,
      constraintClass,
      constraintDurationString,
      constraintMutexString,
    };
  },
});
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
        v-if="constraints.minOff?.enabled"
        :class="constraintClass(constraints.minOff)"
      >
        Minimum OFF time:
        {{ constraintDurationString(constraints.minOff) }}
      </div>
      <div
        v-if="constraints.minOn?.enabled"
        :class="constraintClass(constraints.minOn)"
      >
        Minimum ON time:
        {{ constraintDurationString(constraints.minOn) }}
      </div>
      <div
        v-if="constraints.delayedOn?.enabled"
        :class="constraintClass(constraints.delayedOn)"
      >
        Delay ON:
        {{ constraintDurationString(constraints.delayedOn) }}
      </div>
      <div
        v-if="constraints.delayedOff?.enabled"
        :class="constraintClass(constraints.delayedOff)"
      >
        Delay OFF:
        {{ constraintDurationString(constraints.delayedOff) }}
      </div>
      <div
        v-if="constraints.mutexed?.enabled"
        :class="constraintClass(constraints.mutexed)"
      >
        Mutex:
        {{ constraintMutexString(constraints.mutexed) }}
      </div>
    </div>
  </div>
</template>
