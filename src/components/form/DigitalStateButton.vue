<script setup lang="ts">
import { DigitalState } from 'brewblox-proto/ts';
import { Enum } from 'typescript-string-enums';
import { computed } from 'vue';

interface Props {
  modelValue: DigitalState | number | null;
  pending?: boolean;
  pendingReason?: string | null;
  disable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  pending: false,
  pendingReason: null,
  disable: false,
});

const emit = defineEmits<{
  'update:modelValue': [data: DigitalState];
}>();

const alternatives: Record<number | string, DigitalState> = {
  0: DigitalState.STATE_INACTIVE,
  1: DigitalState.STATE_ACTIVE,
  2: DigitalState.STATE_UNKNOWN,
  Active: DigitalState.STATE_ACTIVE,
  Inactive: DigitalState.STATE_INACTIVE,
  Unknown: DigitalState.STATE_UNKNOWN,
};

const commonOpts = {
  color: 'grey-9',
  toggleColor: 'primary',
  textColor: 'grey',
  toggleTextColor: 'white',
};

const options = [
  {
    ...commonOpts,
    value: DigitalState.STATE_INACTIVE,
    slot: 'off',
  },
  {
    ...commonOpts,
    value: DigitalState.STATE_ACTIVE,
    slot: 'on',
  },
];

const on = DigitalState.STATE_ACTIVE;
const off = DigitalState.STATE_INACTIVE;

const state = computed<DigitalState>({
  get: () => {
    if (props.modelValue == null) {
      return DigitalState.STATE_UNKNOWN;
    }
    if (Enum.isType(DigitalState, props.modelValue)) {
      return props.modelValue;
    }
    return alternatives[props.modelValue] ?? DigitalState.STATE_UNKNOWN;
  },
  set: (v) => emit('update:modelValue', v),
});

const known = computed<boolean>(() => state.value in DigitalState);

function toggle(): void {
  if (!props.disable) {
    state.value = state.value === off ? on : off;
  }
}
</script>

<template>
  <q-btn-toggle
    v-if="known"
    v-bind="{ options, disable, ...$attrs }"
    :model-value="state"
    dense
    unelevated
    @click="toggle"
  >
    <template #off>
      <span class="row">
        <q-tooltip v-if="pending && pendingReason">
          State pending: {{ pendingReason }}
        </q-tooltip>
        <q-spinner v-if="pending && state === off" />
        <span v-else>Off</span>
      </span>
    </template>
    <template #on>
      <span class="row">
        <q-tooltip v-if="pending && pendingReason">
          State pending: {{ pendingReason }}
        </q-tooltip>
        <q-spinner v-if="pending && state === on" />
        <span v-else>On</span>
      </span>
    </template>
  </q-btn-toggle>
  <q-btn
    v-else
    :disable="disable"
    class="reset-button"
    dense
    no-caps
    flat
    color="warning"
    style="padding: 0px"
    @click="toggle"
  >
    Unknown state!
    <q-tooltip>
      Click to try to set to
      <i>inactive</i>
    </q-tooltip>
  </q-btn>
</template>
