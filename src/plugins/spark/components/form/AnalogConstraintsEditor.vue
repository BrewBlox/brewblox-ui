<script lang="ts">
import { emptyAnalogConstraints } from '@/plugins/spark/utils/configuration';
import { AnalogConstraints } from 'brewblox-proto/ts';
import { produce } from 'immer';
import defaults from 'lodash/defaults';
import { computed, defineComponent, PropType, toRaw } from 'vue';

type DNNAnalogConstraints = DeepNonNullable<AnalogConstraints>;

export default defineComponent({
  name: 'AnalogConstraintsEditor',
  props: {
    modelValue: {
      type: Object as PropType<AnalogConstraints>,
      default: () => ({}),
    },
    serviceId: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const constraints = computed<DNNAnalogConstraints>(() =>
      defaults(props.modelValue, emptyAnalogConstraints()),
    );

    function update(
      cb: (draft: DNNAnalogConstraints) => void | DNNAnalogConstraints,
    ): void {
      const updated = produce<DNNAnalogConstraints>(
        toRaw(constraints.value),
        cb,
      );
      emit('update:modelValue', updated);
    }

    return {
      constraints,
      update,
    };
  },
});
</script>

<template>
  <div class="row q-gutter-xs">
    <LabeledField
      label="Minimum"
      class="col-auto min-width-md"
    >
      <q-toggle
        :model-value="constraints.min.enabled"
        dense
        @update:model-value="
          (v) => update((draft) => void (draft.min.enabled = v))
        "
      />
    </LabeledField>
    <InputField
      :model-value="constraints.min.value"
      label="Value"
      type="number"
      class="col-auto min-width-md"
      @update:model-value="(v) => update((draft) => void (draft.min.value = v))"
    />

    <div class="col-break" />

    <LabeledField
      label="Maximum"
      class="col-auto min-width-md"
    >
      <q-toggle
        :model-value="constraints.max.enabled"
        dense
        @update:model-value="
          (v) => update((draft) => void (draft.max.enabled = v))
        "
      />
    </LabeledField>
    <InputField
      :model-value="constraints.max.value"
      label="Value"
      type="number"
      class="col-auto min-width-md"
      @update:model-value="(v) => update((draft) => void (draft.max.value = v))"
    />

    <div class="col-break" />

    <LabeledField
      label="Balanced"
      class="col-auto min-width-md"
    >
      <q-toggle
        :model-value="constraints.balanced.enabled"
        dense
        @update:model-value="
          (v) => update((draft) => void (draft.balanced.enabled = v))
        "
      />
    </LabeledField>
    <LinkField
      :service-id="serviceId"
      :model-value="constraints.balanced.balancerId"
      label="Balancer block"
      class="col-auto min-width-md"
      @update:model-value="
        (v) => update((draft) => void (draft.balanced.balancerId = v))
      "
    />
  </div>
</template>
