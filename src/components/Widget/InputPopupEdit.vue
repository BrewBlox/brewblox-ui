<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    field: {
      type: [String, Number],
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
    type: {
      type: String,
      default: 'text',
    },
    display: {
      type: String,
      default: 'big',
    },
  },
})
export default class InputPopupEdit extends Vue {
  placeholder = null;

  get displayValue() {
    const val = this.$props.field;
    if (val === null || val === undefined || val === '') {
      return '    ';
    }
    return val;
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
    <component :is="$props.display" class="editable">{{ displayValue }}</component>
    <q-popup-edit buttons persistent :title="`Set ${this.$props.label} to:`" v-model="placeholder" @show="startEdit" @save="endEdit">
      <q-input :type="$props.type" v-model="placeholder" />
    </q-popup-edit>
  </div>
</template>

<style scoped>
</style>
