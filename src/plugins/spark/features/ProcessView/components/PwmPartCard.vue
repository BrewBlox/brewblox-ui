<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartCard from './PartCard';

@Component
export default class PwmPartCard extends PartCard {
  get blockCardProps() {
    return {
      ...this.$props,
      types: [
        'ActuatorPwm',
      ],
    };
  }
}
</script>

<template>
  <BlockPartCard v-bind="blockCardProps" v-on="$listeners"/>
</template>
