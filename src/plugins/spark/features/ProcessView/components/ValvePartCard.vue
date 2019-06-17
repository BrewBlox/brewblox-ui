<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartCard from './PartCard';

@Component
export default class ValvePartCard extends PartCard {
  get blockCardProps() {
    return {
      ...this.$props,
      types: ['MotorValve'],
      blockServiceIdKey: 'valveServiceId',
      blockLinkKey: 'valveLink',
    };
  }
}
</script>

<template>
  <BlockPartCard v-bind="blockCardProps" v-on="$listeners"/>
</template>
