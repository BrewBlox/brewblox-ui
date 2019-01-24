<script lang="ts">
import Component from 'vue-class-component';
import FormBase from '@/components/Widget/FormBase';

@Component({
  props: {
    slotIcon: {
      type: String,
      required: false,
    },
    slotLabel: {
      type: String,
      required: false,
    },
  },
})
export default class WidgetSettings extends FormBase {

}
</script>

<template>
  <div>
    <q-toolbar>
      <span class="col row spaced">
        <q-icon v-if="$props.onChangeId" name="mdi-view-dashboard"/>
        <InputPopupEdit
          v-if="$props.onChangeId"
          :field="widgetId"
          :change="$props.onChangeId"
          label="Widget ID"
          display="span"
        />
        <q-icon v-if="$props.slotIcon" :name="$props.slotIcon"/>
        <span v-if="$props.slotLabel">{{ $props.slotLabel }}</span>
        <slot/>
      </span>

      <q-btn v-if="$props.onDelete" flat icon="delete" @click="$props.onDelete"/>
      <q-btn v-if="$props.onCopy" flat icon="file_copy" @click="$props.onCopy"/>
      <q-btn v-if="$props.onMove" flat icon="exit_to_app" @click="$props.onMove"/>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
  </div>
</template>

<style scoped>
.spaced * {
  margin-right: 0.5em;
}
</style>
