<script lang="ts">
import PartCard from './PartCard';
import Component from 'vue-class-component';

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
