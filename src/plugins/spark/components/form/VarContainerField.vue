<script setup lang="ts">
import { DigitalState, Link, Quantity, VarContainer } from 'brewblox-proto/ts';
import { computed } from 'vue';
import { parseDate } from '@/utils/quantity';

interface Props {
  serviceId: string;
  label: string;
}

const container = defineModel<VarContainer>({ required: true });

defineProps<Props>();

const digital = computed<DigitalState | undefined>({
  get: () =>
    'digital' in container.value ? container.value.digital : undefined,
  set: (v) => (container.value = { digital: v! }),
});

const analog = computed<number | undefined>({
  get: () => ('analog' in container.value ? container.value.analog : undefined),
  set: (v) => (container.value = { analog: v! }),
});

const temp = computed<Quantity | undefined>({
  get: () => ('temp' in container.value ? container.value.temp : undefined),
  set: (v) => (container.value = { temp: v! }),
});

const deltaTemp = computed<Quantity | undefined>({
  get: () =>
    'deltaTemp' in container.value ? container.value.deltaTemp : undefined,
  set: (v) => (container.value = { deltaTemp: v! }),
});

const timestamp = computed<Date | null | undefined>({
  get: () =>
    'timestamp' in container.value
      ? parseDate(container.value.timestamp)
      : undefined,
  set: (v) => (container.value = { timestamp: v?.toISOString() ?? '' }),
});

const duration = computed<Quantity | undefined>({
  get: () =>
    'duration' in container.value ? container.value.duration : undefined,
  set: (v) => (container.value = { duration: v! }),
});

const link = computed<Link | undefined>({
  get: () => ('link' in container.value ? container.value.link : undefined),
  set: (v) => (container.value = { link: v! }),
});
</script>

<template>
  <template v-if="digital !== undefined">
    <LabeledField
      class="clickable"
      v-bind="$attrs"
    >
      <template #label>
        <span class="text-label">{{ label }}</span>
        <span class="text-kind">[Digital state]</span>
      </template>
      <DigitalStateButton v-model="digital" />
    </LabeledField>
  </template>
  <template v-if="analog !== undefined">
    <NumberField
      v-model="analog"
      v-bind="$attrs"
    >
      <template #label>
        <span class="text-label">{{ label }}</span>
        <span class="text-kind">[PWM value]</span>
      </template>
    </NumberField>
  </template>
  <template v-if="temp !== undefined">
    <QuantityField
      v-model="temp"
      v-bind="$attrs"
    >
      <template #label>
        <span class="text-label">{{ label }}</span>
        <span class="text-kind">[Temperature]</span>
      </template>
    </QuantityField>
  </template>
  <template v-if="deltaTemp !== undefined">
    <QuantityField
      v-model="deltaTemp"
      v-bind="$attrs"
    >
      <template #label>
        <span class="text-label">{{ label }}</span>
        <span class="text-kind">[Temperature difference]</span>
      </template>
    </QuantityField>
  </template>
  <template v-if="timestamp !== undefined">
    <DatetimeField
      v-model="timestamp"
      default-now
      v-bind="$attrs"
    >
      <template #label>
        <span class="text-label">{{ label }}</span>
        <span class="text-kind">[Timestamp]</span>
      </template>
    </DatetimeField>
  </template>
  <template v-if="duration !== undefined">
    <DurationField
      v-model="duration"
      suffix="Duration value"
      v-bind="$attrs"
    >
      <template #label>
        <span class="text-label">{{ label }}</span>
        <span class="text-kind">[Duration]</span>
      </template>
    </DurationField>
  </template>
  <template v-if="link !== undefined">
    <LinkField
      v-model="link"
      :service-id="serviceId"
      v-bind="$attrs"
    >
      <template #label>
        <span class="text-label">{{ label }}</span>
        <span class="text-kind">[Block link]</span>
      </template>
    </LinkField>
  </template>
</template>

<style scoped lang="sass">
.text-label
  font-size: 140%
  font-weight: bold
  color: $secondary

.text-kind
  font-size: smaller
  margin-left: 5pt
</style>
