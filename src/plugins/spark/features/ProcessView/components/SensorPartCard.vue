<script lang="ts">
import Component from 'vue-class-component';

import PartCard from './PartCard';

@Component
export default class SensorPartCard extends PartCard {
  get blockCardProps() {
    return {
      ...this.$props,
      types: [
        'TempSensorMock',
        'TempSensorOneWire',
      ],
      blockServiceIdKey: 'sensorServiceId',
      blockLinkKey: 'sensorLink',
    };
  }
}
</script>

<template>
  <BlockPartCard v-bind="blockCardProps" v-on="$listeners"/>
</template>
