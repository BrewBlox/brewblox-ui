<script lang="ts">
/* eslint-disable vue/attribute-hyphenation */
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component
export default class PwmIcon extends Vue { }
</script>

<template>
  <SvgIcon v-bind="$attrs" stroke-width="3px">
    <path d="M5,35 h5 v-18 h10 v18 h10 v-18 h10 v18 H45" />
  </SvgIcon>
</template>
