<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component
export default class HeatingIcon extends Vue { }
</script>

<template>
  <SvgIcon v-bind="$attrs">
    <circle cx="25" cy="25" r="15" />
    <path
      d="M23.7,35.9
      c0,0,1.6-2.9,1.6-5.7
      c0-2.7-2.7-6.1-2.7-10
      c0-3.3,3.8-6.2,3.8-6.2
      s-1.6,2.8-1.6,5.4
      c0,3,2.7,6.1,2.7,10.5
      C27.5,33.1,23.7,35.9,23.7,35.9z"
    />
    <path
      d="M21.5,34.6
      c0,0,0.4-2.5-0.7-5.1
      c-0.9-2.2-2.8-4.7-2.8-8.2
      c0-3.3,3.8-6.1,3.8-6.1
      s-1.7,2.4-1.7,5
      c0,3,2.7,5.8,2.7,10.2
      C22.8,33.6,21.5,34.6,21.5,34.6z"
    />
    <path
      d="M28.3,34.7
      c0,0,1.7-2.5,1.7-5.2
      c0-2.7-2.7-6.2-2.7-10.1
      c0-2.2,1.3-4.1,1.3-4.1
      s-0.2,3.4,0.9,5.7
      c0.9,1.8,2.5,4.3,2.5,8
      C32,32.1,28.3,34.7,28.3,34.7z"
    />
  </SvgIcon>
</template>
