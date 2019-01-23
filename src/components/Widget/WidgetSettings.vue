<script lang="ts">
import Component from 'vue-class-component';
import FormBase from '@/components/Widget/FormBase';

@Component
export default class WidgetSettings extends FormBase {

}
</script>

<template>
  <div>
    <q-field label="Widget ID">
      <InputPopupEdit
        v-if="$props.onChangeId"
        :field="widgetId"
        :change="$props.onChangeId"
        class="text-justify"
        label="Widget ID"
      />
      <big v-else>{{ widgetId }}</big>
    </q-field>
    <q-field label="Dashboard Actions">
      <q-btn v-if="$props.onDelete" flat label="Delete" icon="delete" @click="$props.onDelete"/>
      <q-btn v-if="$props.onCopy" flat label="Copy" icon="file_copy" @click="$props.onCopy"/>
      <q-btn v-if="$props.onMove" flat label="Move" icon="exit_to_app" @click="$props.onMove"/>
    </q-field>
    <slot/>
  </div>
</template>
