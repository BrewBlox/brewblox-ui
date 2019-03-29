<script lang="ts">
import Component from 'vue-class-component';
import FormBase from '@/components/Form/FormBase';

@Component
export default class WidgetFormToolbar extends FormBase { }
</script>

<template>
  <FormToolbar>
    <q-icon v-if="$props.onChangeId" name="mdi-view-dashboard"/>
    <InputPopupEdit
      v-if="$props.onChangeId"
      :field="widgetId"
      :change="$props.onChangeId"
      label="Widget name"
      tag="span"
      class="text-h6 q-mr-md"
    >Choose a new name for this dashboard widget.</InputPopupEdit>
    <slot/>
    <template v-slot:buttons>
      <slot name="buttons"/>
      <q-btn v-if="$props.onDelete" flat icon="delete" @click="$props.onDelete"/>
      <q-btn v-if="$props.onCopy" flat icon="file_copy" @click="$props.onCopy"/>
      <q-btn v-if="$props.onMove" flat icon="exit_to_app" @click="$props.onMove"/>
    </template>
  </FormToolbar>
</template>
