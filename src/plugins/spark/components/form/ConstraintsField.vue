<script lang="ts">
import isString from 'lodash/isString';
import { computed, defineComponent, PropType } from 'vue';

import { useField } from '@/composables';
import { analogConstraintLabels, digitalConstraintLabels } from '@/plugins/spark/const';
import type { AnalogConstraint, AnyConstraintsObj, DigitalConstraint } from '@/plugins/spark/types';
import { prettifyConstraints } from '@/plugins/spark/utils';
import { createDialog, prettyQty } from '@/utils';

const constraintLabels = {
  ...digitalConstraintLabels,
  ...analogConstraintLabels,
};

function typeValidator(v: unknown): boolean {
  return isString(v) && ['analog', 'digital'].includes(v);
}

export default defineComponent({
  name: 'ConstraintsField',
  props: {
    ...useField.props,
    modelValue: {
      type: Object as PropType<AnyConstraintsObj>,
      default: () => ({ constraints: [] }),
    },
    title: {
      type: String,
      default: 'Edit constraints',
    },
    serviceId: {
      type: String,
      required: true,
    },
    type: {
      type: String as PropType<'analog' | 'digital'>,
      required: true,
      validator: typeValidator,
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
    function change(obj: AnyConstraintsObj): void {
      emit('update:modelValue', obj);
    }

    const numConstraints = computed<number>(
      () => props.modelValue.constraints.length,
    );

    const limiters = computed<string[]>(
      () => {
        if (props.type === 'analog') {
          return (props.modelValue.constraints as AnalogConstraint[])
            .filter(c => c.limiting)
            .map(c => Object.keys(c).find(k => k !== 'limiting') ?? 'Unknown')
            .map(k => constraintLabels[k] ?? k);
        }
        else {
          return (props.modelValue.constraints as DigitalConstraint[])
            .filter(c => c.remaining.value)
            .map(c => {
              const key = Object.keys(c).find(k => k !== 'remaining') ?? 'Unknown';
              const label = constraintLabels[key] ?? key;
              return `${label} (${prettyQty(c.remaining)})`;
            });
        }
      },
    );

    const textColor = computed<string>(
      () => {
        if (limiters.value.length > 0) { return 'text-pink-4'; }
        if (numConstraints.value > 0) { return 'text-indigo-4'; }
        return 'darkish';
      },
    );

    const displayString = computed<string>(
      () => prettifyConstraints(props.modelValue),
    );

    function openDialog(): void {
      createDialog({
        component: 'ConstraintsDialog',
        componentProps: {
          modelValue: props.modelValue,
          title: props.title,
          message: props.message,
          html: props.html,
          serviceId: props.serviceId,
          type: props.type,
        },
      })
        .onOk(change);
    }

    return {
      numConstraints,
      limiters,
      textColor,
      displayString,
      openDialog,
    };
  },
});
</script>

<template>
  <div
    :class="[
      'q-ma-sm q-pa-sm q-gutter-x-sm row clickable rounded-borders',
      textColor
    ]"
    @click="openDialog"
  >
    <q-icon name="mdi-border-outside" class="col-auto" size="sm" />
    <div class="col-auto">
      <small v-if="limiters.length">
        Limited by:
        <i>{{ limiters.join(', ') }}</i>
      </small>
      <small v-else-if="numConstraints > 0">
        {{ numConstraints }} constraint(s), not limited</small>
      <small v-else>
        No constraints configured</small>
    </div>
    <q-tooltip v-if="numConstraints > 0">
      {{ displayString }}
    </q-tooltip>
  </div>
</template>
