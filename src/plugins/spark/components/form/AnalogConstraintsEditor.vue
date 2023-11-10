<script setup lang="ts">
import { AnalogConstraints } from 'brewblox-proto/ts';
import { produce } from 'immer';
import defaults from 'lodash/defaults';
import { computed, toRaw } from 'vue';
import { emptyAnalogConstraints } from '@/plugins/spark/utils/configuration';

type DNNAnalogConstraints = DeepNonNullable<AnalogConstraints>;

interface Props {
  modelValue?: AnalogConstraints;
  serviceId: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
});

const emit = defineEmits<{
  'update:modelValue': [payload: AnalogConstraints];
}>();

const constraints = computed<DNNAnalogConstraints>(() =>
  defaults(props.modelValue, emptyAnalogConstraints()),
);

function update(
  cb: (draft: DNNAnalogConstraints) => void | DNNAnalogConstraints,
): void {
  const updated = produce<DNNAnalogConstraints>(toRaw(constraints.value), cb);
  emit('update:modelValue', updated);
}
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
    <NumberField
      :model-value="constraints.min.value"
      label="Value"
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
    <NumberField
      :model-value="constraints.max.value"
      label="Value"
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
