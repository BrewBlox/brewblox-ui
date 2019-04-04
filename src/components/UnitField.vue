<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    field: {
      type: Object,
      required: true,
    },
    tag: {
      type: String,
      default: 'big',
    },
    tagClass: {
      type: String,
      default: '',
    },
    unitTag: {
      type: String,
      default: 'span',
    },
  },
})
export default class UnitField extends Vue {
}
</script>

<template>
  <div>
    <component :is="$props.tag" :class="$props.tagClass">{{ this.$props.field.value | round }}</component>
    <component
      v-if="$props.field.value !== null"
      :is="$props.unitTag"
      class="q-ml-xs"
    >{{ this.$props.field.notation }}</component>
  </div>
</template>
