<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';


@Component
export default class PwmDisplay extends PartBase { }
</script>

<template>
  <PwmValues :part="part" settings-key="pwm" />
</template>
