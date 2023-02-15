<script lang="ts">
import { useField } from '@/composables';
import { prettyLink, prettyQty } from '@/utils/quantity';
import {
  DigitalConstraintBase,
  DigitalConstraints,
  MutexedConstraint,
} from 'brewblox-proto/ts';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'DigitalConstraintsField',
  props: {
    ...useField.props,
    modelValue: {
      type: Object as PropType<DigitalConstraints>,
      default: () => ({}),
    },
    title: {
      type: String,
      default: 'Edit constraints',
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
          cls.push('text-indigo-4');
        }
      }
      return cls;
    }

    return {
      constraints,
      isConstrained,
      prettyLink,
      prettyQty,
      constraintClass,
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
        Minimum OFF time: {{ prettyQty(constraints.minOff.duration) }}
      </div>
      <div
        v-if="constraints.minOn?.enabled"
        :class="constraintClass(constraints.minOn)"
      >
        Minimum ON time: {{ prettyQty(constraints.minOn.duration) }}
      </div>
      <div
        v-if="constraints.delayedOn?.enabled"
        :class="constraintClass(constraints.delayedOn)"
      >
        Delay ON: {{ prettyQty(constraints.delayedOn.duration) }}
      </div>
      <div
        v-if="constraints.delayedOff?.enabled"
        :class="constraintClass(constraints.delayedOff)"
      >
        Delay OFF: {{ prettyQty(constraints.delayedOff.duration) }}
      </div>
      <div
        v-if="constraints.mutexed?.enabled"
        :class="constraintClass(constraints.mutexed)"
      >
        Mutex: <i>{{ prettyLink(constraints.mutexed.mutexId) }}</i> <br />
        Mutex hold time: {{ prettyQty(constraints.mutexed.extraHoldTime) }}
        <span v-if="constraints.mutexed.hasLock">(has lock)</span>
      </div>
    </div>
  </div>
</template>
