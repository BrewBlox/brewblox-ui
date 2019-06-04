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
    <template v-slot:buttons>
      <slot name="buttons"/>
      <q-btn flat icon="delete" @click="deleteWidget">
        <q-tooltip>Delete widget</q-tooltip>
      </q-btn>
      <q-btn flat icon="file_copy" @click="copyWidget">
        <q-tooltip>Copy widget</q-tooltip>
      </q-btn>
      <q-btn flat icon="exit_to_app" @click="moveWidget">
        <q-tooltip>Move widget</q-tooltip>
      </q-btn>
    </template>
  </FormToolbar>
</template>
