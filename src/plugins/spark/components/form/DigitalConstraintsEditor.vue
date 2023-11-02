<script lang="ts">
import { emptyDigitalConstraints } from '@/plugins/spark/utils/configuration';
import { DigitalConstraints } from 'brewblox-proto/ts';
import { produce } from 'immer';
import defaults from 'lodash/defaults';
import { computed, defineComponent, PropType, toRaw } from 'vue';

type DNNDigitalConstraints = DeepNonNullable<DigitalConstraints>;

export default defineComponent({
  name: 'DigitalConstraintsEditor',
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
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const constraints = computed<DNNDigitalConstraints>(() =>
      defaults(props.modelValue, emptyDigitalConstraints()),
    );

    function update(
      cb: (draft: DNNDigitalConstraints) => void | DNNDigitalConstraints,
    ): void {
      const updated = produce<DNNDigitalConstraints>(
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
      label="Minimum ON"
      class="col-auto min-width-md"
    >
      <q-toggle
        :model-value="constraints.minOn.enabled"
        dense
        @update:model-value="
          (v) => update((draft) => void (draft.minOn.enabled = v))
        "
      />
    </LabeledField>
    <DurationField
      :model-value="constraints.minOn.duration"
      label="Duration"
      class="col-auto min-width-md"
      @update:model-value="
        (v) => update((draft) => void (draft.minOn.duration = v))
      "
    />

    <div class="col-break" />

    <LabeledField
      label="Minimum OFF"
      class="col-auto min-width-md"
    >
      <q-toggle
        :model-value="constraints.minOff.enabled"
        dense
        @update:model-value="
          (v) => update((draft) => void (draft.minOff.enabled = v))
        "
      />
    </LabeledField>
    <DurationField
      :model-value="constraints.minOff.duration"
      label="Duration"
      class="col-auto min-width-md"
      @update:model-value="
        (v) => update((draft) => void (draft.minOff.duration = v))
      "
    />

    <div class="col-break" />

    <LabeledField
      label="Delay ON"
      class="col-auto min-width-md"
    >
      <q-toggle
        :model-value="constraints.delayedOn.enabled"
        dense
        @update:model-value="
          (v) => update((draft) => void (draft.delayedOn.enabled = v))
        "
      />
    </LabeledField>
    <DurationField
      :model-value="constraints.delayedOn.duration"
      label="Duration"
      class="col-auto min-width-md"
      @update:model-value="
        (v) => update((draft) => void (draft.delayedOn.duration = v))
      "
    />

    <div class="col-break" />

    <LabeledField
      label="Delay OFF"
      class="col-auto min-width-md"
    >
      <q-toggle
        :model-value="constraints.delayedOff.enabled"
        dense
        @update:model-value="
          (v) => update((draft) => void (draft.delayedOff.enabled = v))
        "
      />
    </LabeledField>
    <DurationField
      :model-value="constraints.delayedOff.duration"
      label="Duration"
      class="col-auto min-width-md"
      @update:model-value="
        (v) => update((draft) => void (draft.delayedOff.duration = v))
      "
    />

    <div class="col-break" />

    <LabeledField
      label="Mutex"
      class="col-auto min-width-md"
    >
      <q-toggle
        :model-value="constraints.mutexed.enabled"
        dense
        @update:model-value="
          (v) => update((draft) => void (draft.mutexed.enabled = v))
        "
      />
    </LabeledField>
    <LinkField
      :service-id="serviceId"
      :model-value="constraints.mutexed.mutexId"
      label="Mutex block"
      class="col-auto min-width-md"
      @update:model-value="
        (v) => update((draft) => void (draft.mutexed.mutexId = v))
      "
    />
    <DurationField
      :model-value="constraints.mutexed.extraHoldTime"
      label="Extra hold time"
      class="col-auto min-width-md"
      @update:model-value="
        (v) => update((draft) => void (draft.mutexed.extraHoldTime = v))
      "
    />
  </div>
</template>
