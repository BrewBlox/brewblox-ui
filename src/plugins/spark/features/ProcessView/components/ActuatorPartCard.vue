<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartCard from './PartCard';

@Component
export default class ActuatorPartCard extends PartCard {
  get blockCardProps() {
    return {
      ...this.$props,
      types: ['DigitalActuator'],
      blockServiceIdKey: 'actuatorServiceId',
      blockLinkKey: 'actuatorLink',
    };
  }
}
</script>

<template>
  <BlockPartCard v-bind="blockCardProps" v-on="$listeners"/>
</template>
