<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Unit } from '@/helpers/units';

@Component({
  props: {
    field: {
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    change: {
      type: Function,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
})
export default class SelectPopupEdit extends Vue {
  placeholder = null;

  get displayValue() {
    return (this.$props.options
      .find((opt: any) => opt.value === this.$props.field)
      || { label: '-' })
      .label;
  }

  startEdit() {
    this.placeholder = this.$props.field;
  }

  endEdit() {
    this.$props.change(this.placeholder);
  }
}
</script>

<template>
  <div>
    <big class="editable">{{ displayValue }}</big>
    <q-popup-edit
      buttons
      persistent
      :title="`Set ${this.$props.label} to:`"
      v-model="placeholder"
      @show="startEdit"
      @save="endEdit"
    >
      <q-select
        v-model="placeholder"
        :options="$props.options"
      />
    </q-popup-edit>
  </div>
</template>

<style scoped>
</style>
