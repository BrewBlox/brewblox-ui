<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

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
    short: {
      type: Boolean,
      default: false,
    },
    resetIcon: {
      type: String,
      default: 'restore',
    },
    clearLabel: {
      type: String,
      default: '<not set>',
    },
  },
})
export default class DatetimePopupEdit extends Vue {
  placeholder = -1; // must not equal clear-value

  get dateString() {
    if (!this.$props.field) {
      return this.$props.clearLabel;
    }
    const date = new Date(this.$props.field);
    return this.$props.short
      ? date.toLocaleDateString()
      : date.toLocaleString();
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
      :disable="$attrs.disabled"
      :title="`Set ${this.$props.label} to:`"
      v-model="placeholder"
      buttons
      persistent
      @show="startEdit"
      @save="endEdit"
    >
      <q-datetime
        v-model="placeholder"
        :after="[
          {
            icon: $props.resetIcon,
            handler: () => placeholder = new Date().getTime(),
          }
        ]"
        dark
        format24h
        clearable
        type="datetime"
      />
    </q-popup-edit>
  </div>
</template>

