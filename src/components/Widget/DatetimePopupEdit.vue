<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

@Component({
  props: {
    field: {
      type: [Number, String],
      required: false,
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
      default: 'span',
    },
  },
})
export default class DatetimePopupEdit extends Vue {
  placeholder = -1; // must not equal clear-value

  get dateString() {
    return this.$props.field
      ? new Date(this.$props.field).toLocaleString()
      : '<not set>';
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
    <component :is="$props.display" class="editable">{{ dateString }}</component>
    <q-popup-edit
      buttons
      persistent
      :title="`Set ${this.$props.label} to:`"
      v-model="placeholder"
      @show="startEdit"
      @save="endEdit"
    >
      <q-datetime
        dark
        format24h
        clearable
        type="datetime"
        v-model="placeholder"
        :after="[
          {
            icon: 'restore',
            handler: () => placeholder = new Date().getTime(),
          }
        ]"
      />
    </q-popup-edit>
  </div>
</template>

<style scoped>
</style>
