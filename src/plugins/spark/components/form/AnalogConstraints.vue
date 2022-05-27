<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';

import { analogConstraintLabels } from '@/plugins/spark/const';
import {
  AnalogConstraint,
  AnalogConstraintKey,
  AnalogConstraintsObj,
  BlockType,
} from '@/plugins/spark/types';
import { createDialog } from '@/utils/dialog';
import { bloxLink } from '@/utils/link';
import { deepCopy } from '@/utils/objects';

const constraintOpts: SelectOption[] = Object.entries(
  analogConstraintLabels,
).map(([k, v]) => ({ value: k, label: v }));

const defaultValues: Record<AnalogConstraintKey, AnalogConstraint> = {
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
      balancerId: bloxLink(null, BlockType.Balancer),
      granted: 0,
      id: 0,
    },
  },
};

export default defineComponent({
  name: 'AnalogConstraints',
  props: {
    modelValue: {
      type: Object as PropType<AnalogConstraintsObj>,
      default: () => ({ constraints: [] }),
    },
    serviceId: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const constraints = ref<AnalogConstraint[]>([]);

    watch(
      () => props.modelValue,
      (newV) => (constraints.value = deepCopy(newV.constraints)),
      { deep: true, immediate: true },
    );

    function save(): void {
      emit('update:modelValue', { constraints: constraints.value });
    }

    function add(): void {
      createDialog({
        component: 'CheckboxDialog',
        componentProps: {
          title: 'Add constraint',
          selectOptions: constraintOpts,
          modelValue: [],
        },
      }).onOk((keys: AnalogConstraintKey[]) => {
        constraints.value.push(
          ...keys.map((type) => deepCopy(defaultValues[type])),
        );
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
      add,
      remove,
    };
  },
});
</script>

<template>
  <div class="column q-gutter-y-sm">
    <div
      v-for="(constraint, idx) in constraints"
      :key="`constraint-${idx}`"
      :class="[
        'row q-gutter-x-sm constraint',
        { limiting: constraint.limiting },
      ]"
    >
      <LinkField
        v-if="'balanced' in constraint"
        :service-id="serviceId"
        :model-value="constraint.balanced.balancerId"
        title="Balancer"
        label="Balancer"
        class="col-grow"
        @update:model-value="
          (v) => {
            constraint.balanced.balancerId = v;
            save();
          }
        "
      />
      <InputField
        v-if="'min' in constraint"
        :model-value="constraint.min"
        title="Minimum value"
        label="Minimum value"
        type="number"
        class="col-grow"
        @update:model-value="
          (v) => {
            constraint.min = v;
            save();
          }
        "
      />
      <InputField
        v-if="'max' in constraint"
        :model-value="constraint.max"
        title="Maximum value"
        label="Maximum value"
        type="number"
        class="col-grow"
        @update:model-value="
          (v) => {
            constraint.max = v;
            save();
          }
        "
      />

      <div class="col-auto column justify-center darkish">
        <q-btn
          icon="delete"
          flat
          round
          @click="remove(idx)"
        >
          <q-tooltip>Remove constraint</q-tooltip>
        </q-btn>
      </div>
    </div>
    <div class="col row justify-end">
      <q-btn
        icon="add"
        round
        outline
        @click="add"
      >
        <q-tooltip>Add constraint</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<style
  lang="sass"
  scoped
>
.limiting
  color: orange

.constraint:nth-child(even) > label
  background: rgba($green-5, 0.05)

.constraint:nth-child(odd) > label
  background: rgba($blue-5, 0.05)
</style>
