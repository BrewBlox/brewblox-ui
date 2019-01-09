<script lang="ts">
import { Unit } from '@/helpers/units';
import Vue from 'vue';
import Component from 'vue-class-component';
import { unitDurationString } from '@/helpers/functional';
import parseDuration from 'parse-duration';

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
export default class TimeUnitPopupEdit extends Vue {
  placeholder: any = NaN; // must not equal clear-value

  startEdit() {
    this.placeholder = unitDurationString(this.$props.field);
  }

  endEdit() {
    const fieldCopy = new Unit(parseDuration(this.placeholder), 'ms');
    this.$props.change(fieldCopy);
  }
}
</script>

<template>
  <div>
    <component :is="$props.display" class="editable">{{ this.$props.field | unitDuration }}</component>
    <q-popup-edit
      :title="`Set ${this.$props.label} to:`"
      v-model="placeholder"
      buttons
      persistent
      @show="startEdit"
      @save="endEdit"
    >
      <q-input v-model="placeholder"/>
    </q-popup-edit>
  </div>
</template>

