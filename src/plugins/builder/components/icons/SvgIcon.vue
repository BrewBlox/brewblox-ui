<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';


@Component
export default class SvgIcon extends Vue {

}
</script>

<template>
  <svg v-bind="$attrs" viewBox="0,0,50,50" stroke="white" class="col static q-pt-xs">
    <slot />
  </svg>
</template>
