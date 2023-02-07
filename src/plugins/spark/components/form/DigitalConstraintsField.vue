<script lang="ts">
import { useField } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { DigitalConstraintBase, DigitalConstraints } from 'brewblox-proto/ts';
import { defineComponent, PropType } from 'vue';

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
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    function change(constraints: DigitalConstraints): void {
      emit('update:modelValue', constraints);
    }

    function openDialog(): void {
      createDialog({
        component: 'ConstraintsDialog',
        componentProps: {
          modelValue: props.modelValue,
          title: props.title,
          message: props.message,
          html: props.html,
          serviceId: props.serviceId,
        },
      }).onOk(change);
    }

    function constraintStyle(constraint?: DigitalConstraintBase): string[] {
      const style: string[] = [];
      if (!constraint) {
        style.push('darkish');
      } else if (constraint.limiting) {
        style.push('text-pink-4');
      } else if (constraint.enabled) {
        style.push('text-indigo-4');
      } else {
        style.push('darkish');
      }
      return style;
    }

    return {
      constraintStyle,
      openDialog,
    };
  },
});
</script>

<template>
  <div
    class="q-ma-sm q-pa-sm q-gutter-x-sm row clickable rounded-borders"
    @click="openDialog"
  >
    <q-icon
      name="mdi-border-outside"
      class="col-auto"
      size="sm"
    />
    <div class="col-auto">
      <small :class="constraintStyle(modelValue.minOff)">minOff</small>
      <small :class="constraintStyle(modelValue.minOn)">minOn</small>
      <small :class="constraintStyle(modelValue.delayedOn)">delayedOn</small>
      <small :class="constraintStyle(modelValue.delayedOff)">delayedOff</small>
      <small :class="constraintStyle(modelValue.mutexed)">mutexed</small>
    </div>
    <!--
        <small
        v-if="limiters.length"
      >
        Limited by:
        <i>{{ limiters.join(', ') }}</i>
      </small>
      <small v-else-if="numConstraints > 0">
        {{ numConstraints }} constraint(s), not limited
      </small>
      <small v-else> No constraints configured</small>
    </div>
    -->
    <!-- <q-tooltip v-if="numConstraints > 0">
      {{ displayString }}
    </q-tooltip> -->
  </div>
</template>
