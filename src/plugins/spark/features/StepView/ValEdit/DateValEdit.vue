<script lang="ts">
import { Component } from 'vue-property-decorator';

import ValEdit from './ValEdit';


@Component({
  props: {
    timeScale: {
      type: Number,
      default: 1,
    },
  },
})
export default class DateValEdit extends ValEdit {
  get scaledField() {
    return this.field * this.$props.timeScale;
  }

  get displayVal() {
    return new Date(this.scaledField).toLocaleString();
  }

  saveScaledField(val: number) {
    this.saveField(val / this.$props.timeScale);
  }
}
</script>

<template>
  <DatetimePopupEdit
    v-if="editable"
    :field="scaledField"
    :change="saveScaledField"
    label="Start time"
    tag="span"
  />
  <div v-else>{{ displayVal }}</div>
</template>
