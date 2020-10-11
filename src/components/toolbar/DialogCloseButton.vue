<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';


@Component
export default class DialogCloseButton extends Vue { }
</script>

<template>
  <q-btn v-close-popup flat icon="mdi-close-circle" />
</template>
