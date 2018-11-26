<script lang="ts">
import { Unit } from '@/helpers/units';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    field: {
      type: Object,
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
    display: {
      type: String,
      default: 'big',
    },
  },
})
export default class UnitPopupEdit extends Vue {
  placeholder = NaN; // must not equal clear-value

  get notation() {
    return this.$props.field.notation;
  }

  get initialValue() {
    return this.$props.field.value;
  }

  startEdit() {
    this.placeholder = this.initialValue;
  }

  endEdit() {
    const fieldCopy = new Unit(this.placeholder, this.$props.field.unit);
    this.$props.change(fieldCopy);
  }
}
</script>

<template>
  <div>
    <component :is="$props.display" class="editable">{{ this.$props.field | unit }}</component>
    <q-popup-edit
      buttons
      persistent
      :title="`Set ${this.$props.label} to:`"
      v-model="placeholder"
      @show="startEdit"
      @save="endEdit"
    >
      <q-input type="number" :suffix="this.notation" v-model="placeholder"/>
    </q-popup-edit>
  </div>
</template>

<style scoped>
</style>
