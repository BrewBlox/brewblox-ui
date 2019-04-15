<script lang="ts">
import PartCard from './PartCard';
import Component from 'vue-class-component';

@Component
export default class ActuatorPartCard extends PartCard {
  get blockCardProps() {
    return {
      ...this.$props,
      types: [
        'ActuatorPin',
        'ActuatorDS2413',
      ],
      blockServiceIdKey: 'actuatorServiceId',
      blockLinkKey: 'actuatorLink',
    };
  }
}
</script>

<template>
  <BlockPartCard v-bind="blockCardProps" v-on="$listeners"/>
</template>
