<script setup lang="ts">
import { AnalogModuleChannel } from 'brewblox-proto/ts';

interface Props {
  channels: AnalogModuleChannel[];
}

defineProps<Props>();
</script>

<template>
  <div class="column q-gutter-y-sm">
    <div
      v-for="channel in channels"
      :key="`channel-${channel.id}`"
      class="row q-gutter-sm"
    >
      <NumberField
        v-model="channel.id"
        label="ID"
        readonly
      />
      <LabeledField
        label="Sensor Type"
        readonly
      >
        {{ channel.sensorType }}
      </LabeledField>
    </div>
  </div>
</template>
