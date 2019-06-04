<script lang="ts">
import { Component } from 'vue-property-decorator';

import FormBase from '@/components/Form/FormBase';

@Component
export default class WidgetFormToolbar extends FormBase { }
</script>

<template>
  <FormToolbar>
    <span class="text-h6 q-mr-md">{{ widget.title }}</span>
    <slot/>
  </FormToolbar>
</template>
